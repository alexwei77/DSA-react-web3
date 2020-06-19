export const genericResolver = async (dsa, protocol, dsaAddress) => {
return await dsa["protocol"].getPosition(dsaAddress);
}

export const makerVaultResolver = async (dsa, dsaAddress) => {
return await dsa.maker.getVaults(dsaAddress);
}

export const makerDSRResolver = async (dsa, dsaAddress) => {
return await dsa.maker.getDaiPosition(address);
}