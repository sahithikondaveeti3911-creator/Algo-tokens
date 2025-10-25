/**
 * AlgoToken.ts
 * Algorand ASA Management + Factory Logic
 * ----------------------------------------
 * Provides a class-based interface to create and manage Algorand Standard Assets (ASAs)
 * through the Algorand JavaScript SDK, while keeping state tracking similar to
 * the original Algopy contract.
 */

import algosdk from 'algosdk'

/** ---------- INTERFACES ---------- **/

export interface TokenConfig {
  name: string
  unitName: string
  totalSupply: number
  decimals?: number
  url?: string
  metadataHash?: string
  manager?: string
  reserve?: string
  freeze?: string
  clawback?: string
}

export interface CreatedASA {
  assetId: number
  txId: string
  name: string
  unitName: string
  totalSupply: number
}

/** ---------- CORE TOKEN CLASS ---------- **/

export class AlgoToken {
  private client: algosdk.Algodv2
  private creatorAddress: string
  private totalCreated: number = 0

  constructor(client: algosdk.Algodv2, creatorAddress: string) {
    this.client = client
    this.creatorAddress = creatorAddress
  }

  /** Simple test method */
  public hello(name: string): string {
    return `Hello, ${name}! Welcome to AlgoToken.`
  }

  /** Returns total number of created ASAs */
  public getTotalCreated(): number {
    return this.totalCreated
  }

  /** Returns contract creator address */
  public getCreator(): string {
    return this.creatorAddress
  }

  /**
   * Create a new ASA token
   * Uses the creator’s account as the transaction sender.
   */
  public async createToken(
    token: TokenConfig,
    signer: (txns: Uint8Array[]) => Promise<Uint8Array[]>
  ): Promise<CreatedASA> {
    try {
      const params = await this.client.getTransactionParams().do()

      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: this.creatorAddress,
        total: token.totalSupply,
        decimals: token.decimals || 0,
        assetName: token.name,
        unitName: token.unitName,
        assetURL: token.url || '',
        assetMetadataHash: token.metadataHash
          ? new Uint8Array(Buffer.from(token.metadataHash, 'base64'))
          : undefined,
        manager: token.manager || this.creatorAddress,
        reserve: token.reserve || this.creatorAddress,
        freeze: token.freeze || this.creatorAddress,
        clawback: token.clawback || this.creatorAddress,
        suggestedParams: params,
      })

      const signed = await signer([txn.toByte()])
      const { txId } = await this.client.sendRawTransaction(signed[0]).do()

      const confirmedTxn = await algosdk.waitForConfirmation(this.client, txId, 4)
      const assetId = confirmedTxn['asset-index']

      this.totalCreated++
      console.log(`✅ ASA Created: ${token.name} (${token.unitName}) [ID: ${assetId}]`)

      return {
        assetId,
        txId,
        name: token.name,
        unitName: token.unitName,
        totalSupply: token.totalSupply,
      }
    } catch (error: any) {
      console.error('❌ Error creating ASA:', error)
      throw new Error(error.message)
    }
  }
}

/** ---------- FACTORY PATTERN ---------- **/

export class AlgoTokenFactory {
  private client: algosdk.Algodv2
  private factoryOwner: string
  private deployedTokens: CreatedASA[] = []

  constructor(client: algosdk.Algodv2, owner: string) {
    this.client = client
    this.factoryOwner = owner
  }

  /**
   * Deploy a new token under this factory
   */
  public async deployToken(
    tokenConfig: TokenConfig,
    signer: (txns: Uint8Array[]) => Promise<Uint8Array[]>
  ): Promise<CreatedASA> {
    const algoToken = new AlgoToken(this.client, this.factoryOwner)
    const createdToken = await algoToken.createToken(tokenConfig, signer)

    this.deployedTokens.push(createdToken)
    return createdToken
  }

  /** Get all tokens created via this factory */
  public getAllTokens(): CreatedASA[] {
    return this.deployedTokens
  }

  /** Find token by name or ID */
  public findToken(search: string | number): CreatedASA | undefined {
    if (typeof search === 'number') {
      return this.deployedTokens.find((t) => t.assetId === search)
    }
    return this.deployedTokens.find((t) =>
      t.name.toLowerCase().includes((search as string).toLowerCase())
    )
  }

  /** Return total count of deployed tokens */
  public getTokenCount(): number {
    return this.deployedTokens.length
  }

  public getOwner(): string {
    return this.factoryOwner
  }
}

/** ---------- USAGE EXAMPLE ---------- **/

/*
(async () => {
  const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443)
  const creatorAddress = 'YOUR_CREATOR_ADDRESS'

  const tokenFactory = new AlgoTokenFactory(algodClient, creatorAddress)
  const signer = async (txns: Uint8Array[]) => {
    // Replace this with PeraWalletConnect / @txnlab/use-wallet-react signer
    return txns.map((txn) => txn)
  }

  const newToken = await tokenFactory.deployToken(
    {
      name: 'MyToken',
      unitName: 'MTK',
      totalSupply: 1000000,
      decimals: 0,
    },
    signer
  )

  console.log('New ASA Created:', newToken)
  console.log('Total tokens in factory:', tokenFactory.getTokenCount())
})()
*/

