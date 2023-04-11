import { useStorage } from "@vueuse/core";
import { defineStore, storeToRefs } from "pinia";
import { getChangePubkeyLegacyMessage, MAX_TIMESTAMP } from "zksync/build/utils";

import type { BatchBuilder } from "zksync/build/batch-builder";
import type { PubKeyHash } from "zksync/build/types";

import { useLiteWalletStore } from "@/store/zksync/lite/wallet";
import { formatError } from "@/utils/formatters";

type AccountActivationTx = {
  accountId: number;
  account: string;
  newPkHash: PubKeyHash;
  nonce: number;
  ethSignature?: string;
  validFrom: number;
  validUntil: number;
  ethAuthData?: {
    type: "Onchain";
  };
};

export const useLiteAccountActivationStore = defineStore("liteAccountActivation", () => {
  const liteWalletStore = useLiteWalletStore();
  const { walletAddress, isAuthorized, isRemoteWallet, accountState } = storeToRefs(liteWalletStore);
  const storageAccountActivations = useStorage<{ [userAddress: string]: AccountActivationTx }>(
    "account-activations",
    {}
  );

  const {
    result: isAccountActivated,
    inProgress: accountActivationCheckInProgress,
    execute: checkAccountActivation,
    reset: resetAccountActivation,
  } = usePromise<boolean>(async () => {
    const wallet = await liteWalletStore.getWalletInstance();
    if (!wallet) throw new Error("Wallet is not available");
    const accountState = await liteWalletStore.requestAccountState();
    if (!accountState) throw new Error("Account state is not available");

    if (isAuthorized.value) {
      const newPubKeyHash = await liteWalletStore.getSignerPubKeyHash();
      return accountState.committed.pubKeyHash === newPubKeyHash;
    } else {
      return accountState.committed.pubKeyHash !== "sync:0000000000000000000000000000000000000000";
    }
  });
  watch(isAuthorized, (authorized) => {
    if (authorized) {
      checkAccountActivation({ force: true });
    }
  });

  const isAccountActivationSigned = computed(() => {
    const signedActivation = storageAccountActivations.value[walletAddress.value!];
    if (signedActivation && !accountState.value) {
      return true;
    } else if (signedActivation && accountState.value) {
      if (
        signedActivation.accountId === accountState.value.id &&
        signedActivation.nonce === accountState.value.committed.nonce
      ) {
        return true;
      }
    }
    return false;
  });
  const canSignAccountActivation = computed(() => {
    if (typeof accountState.value?.id === "number") {
      return true;
    }
    return false;
  });
  const {
    inProgress: accountActivationSigningInProgress,
    error: accountActivationSigningError,
    execute: accountActivationSign,
    reset: resetAccountActivationSign,
  } = usePromise<void>(async () => {
    const accountState = await liteWalletStore.requestAccountState({ force: true });
    if (!accountState) throw new Error("Account state is not available");
    if (!canSignAccountActivation.value) {
      throw new TypeError(
        "It is required to have a history of committed balances on the account to activate it. If you have deposited funds wait a while until they become available"
      );
    }

    const wallet = await liteWalletStore.getWalletInstance();
    if (!wallet) throw new Error("Wallet is not available");

    if (!isRemoteWallet.value && wallet.ethSignerType?.verificationMethod === "ERC-1271") {
      const isOnchainAuthSigningKeySet = await wallet.isOnchainAuthSigningKeySet();
      if (!isOnchainAuthSigningKeySet) {
        const onchainAuthTransaction = await wallet.onchainAuthSigningKey();
        await onchainAuthTransaction?.wait();
      }
    }

    const newPubKeyHash = await liteWalletStore.getSignerPubKeyHash();
    console.log("1", { newPubKeyHash, nonce: accountState.committed.nonce, id: accountState.id! });
    const changePubKeyMessage = getChangePubkeyLegacyMessage(
      newPubKeyHash,
      accountState.committed.nonce,
      accountState.id!
    );
    const ethSignature = (await wallet.ethMessageSigner().getEthMessageSignature(changePubKeyMessage)).signature;
    storageAccountActivations.value[walletAddress.value!] = {
      accountId: accountState.id!,
      account: wallet.address(),
      newPkHash: newPubKeyHash,
      nonce: accountState.committed.nonce,
      ethSignature,
      validFrom: 0,
      validUntil: MAX_TIMESTAMP,
    };
    console.log(2, {
      accountId: accountState.id!,
      account: wallet.address(),
      newPkHash: newPubKeyHash,
      nonce: accountState.committed.nonce,
      ethSignature,
      validFrom: 0,
      validUntil: MAX_TIMESTAMP,
    });
  });

  const getAccountActivationTransaction = async (feeTokenId: number) => {
    if (!isAccountActivationSigned.value) throw new Error("Account activation is not signed");

    const wallet = await liteWalletStore.getWalletInstance(true);
    if (!wallet) throw new Error("Wallet is not available");

    const signedActivation = storageAccountActivations.value[walletAddress.value!];
    return await wallet.signer!.signSyncChangePubKey({
      ...signedActivation,
      fee: "0",
      feeTokenId,
    });
  };

  watch(walletAddress, (address, oldAddress) => {
    if (address) {
      if (oldAddress) {
        checkAccountActivation({ force: true });
      } else {
        checkAccountActivation();
      }
    } else {
      resetAccountActivation();
    }
    resetAccountActivationSign();
  });

  return {
    isAccountActivated,
    accountActivationCheckInProgress,
    checkAccountActivation,

    isAccountActivationSigned,
    canSignAccountActivation,
    accountActivationSigningError: computed(() => formatError(accountActivationSigningError.value)),
    accountActivationSigningInProgress,
    accountActivationSign,

    getAccountActivationTransaction,
  };
});
