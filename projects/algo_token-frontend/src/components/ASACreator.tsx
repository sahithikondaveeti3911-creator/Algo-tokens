import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import algosdk from 'algosdk'

interface ASACreatorInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

interface TokenDetails {
  name: string
  unitName: string
  totalSupply: number
  decimals: number
  url: string
  metadataHash: string
  manager: string
  reserve: string
  freeze: string
  clawback: string
}

interface ValidationErrors {
  [key: string]: string | undefined
}

const ASACreator = ({ openModal, setModalState }: ASACreatorInterface) => {
  const [loading, setLoading] = useState(false)
  const [tokenDetails, setTokenDetails] = useState<TokenDetails>({
    name: '',
    unitName: '',
    totalSupply: 1000000,
    decimals: 0,
    url: '',
    metadataHash: '',
    manager: '',
    reserve: '',
    freeze: '',
    clawback: '',
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [estimatedFee, setEstimatedFee] = useState('0.1')

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()
  const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443)

  const isValidAddress = (address: string) => {
    if (!address) return true
    try {
      algosdk.decodeAddress(address)
      return true
    } catch {
      return false
    }
  }

  const isValidBase64 = (str: string) => {
    if (!str) return true
    try {
      return btoa(atob(str)) === str
    } catch {
      return false
    }
  }

  useEffect(() => {
    const baseFee = 0.1
    const supplyMultiplier = Math.max(1, Math.log10(tokenDetails.totalSupply) - 5)
    const estimated = (baseFee * supplyMultiplier).toFixed(3)
    setEstimatedFee(estimated)
  }, [tokenDetails.totalSupply])

  const handleInputChange = (field: keyof TokenDetails, value: string | number) => {
    setTokenDetails((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const errors: ValidationErrors = {}

    if (!tokenDetails.name.trim()) errors.name = 'Asset name is required'
    else if (tokenDetails.name.length > 32) errors.name = 'Max 32 characters'

    if (!tokenDetails.unitName.trim()) errors.unitName = 'Unit name required'
    else if (tokenDetails.unitName.length > 8) errors.unitName = 'Max 8 characters'

    if (tokenDetails.totalSupply < 1) errors.totalSupply = 'Must be at least 1'
    if (tokenDetails.decimals < 0 || tokenDetails.decimals > 19)
      errors.decimals = 'Between 0 and 19 only'
    if (tokenDetails.metadataHash && !isValidBase64(tokenDetails.metadataHash))
      errors.metadataHash = 'Invalid Base64 hash'

    ;['manager', 'reserve', 'freeze', 'clawback'].forEach((addr) => {
      const value = tokenDetails[addr as keyof TokenDetails]
      if (value && !isValidAddress(value)) errors[addr] = `Invalid ${addr} address`
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const createASA = async () => {
    if (!activeAddress || !transactionSigner) {
      enqueueSnackbar('Please connect your wallet first.', { variant: 'error' })
      return
    }
    if (!validateForm()) {
      enqueueSnackbar('Fix validation errors.', { variant: 'error' })
      return
    }

    setLoading(true)
    try {
      const params = await algodClient.getTransactionParams().do()

      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        assetName: tokenDetails.name,
        unitName: tokenDetails.unitName,
        total: tokenDetails.totalSupply,
        decimals: tokenDetails.decimals,
        assetURL: tokenDetails.url || undefined,
        assetMetadataHash: tokenDetails.metadataHash
          ? new Uint8Array(Buffer.from(tokenDetails.metadataHash, 'base64'))
          : undefined,
        manager: tokenDetails.manager || activeAddress,
        reserve: tokenDetails.reserve || activeAddress,
        freeze: tokenDetails.freeze || activeAddress,
        clawback: tokenDetails.clawback || activeAddress,
        suggestedParams: params,
      })

      const signedTxn = await transactionSigner([txn], [0])
      const response = await algodClient.sendRawTransaction(signedTxn).do()
      const txId = response.txid
      const confirmed = await algosdk.waitForConfirmation(algodClient, txId, 4)
      enqueueSnackbar(`✅ ASA Created! Asset ID: ${confirmed.assetIndex}`, { variant: 'success' })
      setTokenDetails({
        name: '',
        unitName: '',
        totalSupply: 1000000,
        decimals: 0,
        url: '',
        metadataHash: '',
        manager: '',
        reserve: '',
        freeze: '',
        clawback: '',
      })
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="asa_creator_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
      <form
        method="dialog"
        className="modal-box w-full max-w-3xl bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white shadow-2xl rounded-2xl border border-gray-700"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            🚀 Create ASA Token
          </h2>
          <p className="text-gray-300 mt-2">Deploy your own Algorand asset instantly on TestNet</p>
        </div>

        {/* Fee Estimate */}
        <div className="mb-6 bg-white/10 border border-blue-500/30 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="font-semibold text-blue-300">Estimated Fee</p>
            <p className="text-sm text-gray-300">Transaction cost on TestNet</p>
          </div>
          <p className="text-2xl font-bold text-cyan-300">≈ {estimatedFee} ALGO</p>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['name', 'Asset Name *', 'MyToken'],
            ['unitName', 'Unit Name *', 'MTK'],
            ['totalSupply', 'Total Supply', '1000000'],
            ['decimals', 'Decimals', '0'],
          ].map(([field, label, placeholder]) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm font-semibold text-gray-300 mb-1">{label}</label>
              <input
                type={field === 'totalSupply' || field === 'decimals' ? 'number' : 'text'}
                placeholder={placeholder}
                className="input input-bordered bg-white/10 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500"
                value={tokenDetails[field as keyof TokenDetails] as string | number}
                onChange={(e) =>
                  handleInputChange(
                    field as keyof TokenDetails,
                    field === 'totalSupply' || field === 'decimals'
                      ? parseInt(e.target.value) || 0
                      : e.target.value
                  )
                }
              />
              {validationErrors[field] && (
                <span className="text-red-400 text-sm mt-1">{validationErrors[field]}</span>
              )}
            </div>
          ))}
        </div>

        {/* Extra Fields */}
        <div className="mt-6 space-y-4">
          {[
            ['url', 'Asset URL', 'https://example.com'],
            ['metadataHash', 'Metadata Hash (Base64)', 'Optional metadata hash'],
            ['manager', 'Manager Address', 'Leave empty to use your address'],
            ['reserve', 'Reserve Address', 'Leave empty to use your address'],
            ['freeze', 'Freeze Address', 'Leave empty to use your address'],
            ['clawback', 'Clawback Address', 'Leave empty to use your address'],
          ].map(([field, label, placeholder]) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm font-semibold text-gray-300 mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                className="input input-bordered bg-white/10 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500"
                value={tokenDetails[field as keyof TokenDetails] as string}
                onChange={(e) => handleInputChange(field as keyof TokenDetails, e.target.value)}
              />
              {validationErrors[field] && (
                <span className="text-red-400 text-sm mt-1">{validationErrors[field]}</span>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 mt-8">
          <h4 className="font-semibold text-amber-300 mb-2">⚠️ Important Notes</h4>
          <ul className="text-sm text-amber-200 space-y-1">
            <li>• Ensure sufficient ALGO balance for fees</li>
            <li>
              • Get free TestNet ALGO from{' '}
              <a
                href="https://testnet.algoexplorer.io/dispenser"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline hover:text-blue-200"
              >
                AlgoExplorer Dispenser
              </a>
            </li>
            <li>• Only Asset Name and Unit Name are required</li>
            <li>• All transactions are auto-signed via Pera Wallet</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 border-t border-gray-700 pt-6">
          <button
            className="btn bg-gray-700 hover:bg-gray-600 border-none"
            onClick={() => setModalState(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-none hover:opacity-90 px-8"
            onClick={createASA}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span> Creating...
              </>
            ) : (
              <>
                <span className="text-xl mr-2">⚡</span> Create Token
              </>
            )}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default ASACreator
