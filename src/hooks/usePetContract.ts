"use client";

import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { ActionType, PET_CORE_ADDRESS, petCoreAbi } from "@/lib/contracts";

/**
 * PetCore sözleşmesi için read/write hook'ları.
 * Aktif zincire göre doğru sözleşme adresini seçer.
 */
export function usePetContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = PET_CORE_ADDRESS[chainId];

  const { data: hasPet, refetch: refetchHasPet } = useReadContract({
    address: contractAddress,
    abi: petCoreAbi,
    functionName: "hasPet",
    args: address ? [address] : undefined,
    // RPC gecikmesine karşı periyodik yenileme → XP/bar güncel kalır.
    query: { enabled: Boolean(address && contractAddress), refetchInterval: 8000 },
  });

  const { data: pet, refetch: refetchPet } = useReadContract({
    address: contractAddress,
    abi: petCoreAbi,
    functionName: "getPet",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && contractAddress), refetchInterval: 8000 },
  });

  const { writeContract, writeContractAsync, isPending, error } = useWriteContract();

  function createPet(name: string) {
    return writeContractAsync({
      address: contractAddress,
      abi: petCoreAbi,
      functionName: "createPet",
      args: [name],
    });
  }

  function performAction(action: ActionType) {
    return writeContractAsync({
      address: contractAddress,
      abi: petCoreAbi,
      functionName: "performAction",
      args: [action],
    });
  }

  return {
    address,
    chainId,
    contractAddress,
    hasPet,
    pet,
    isPending,
    error,
    createPet,
    performAction,
    writeContract,
    refetch: () => {
      refetchHasPet();
      refetchPet();
    },
  };
}
