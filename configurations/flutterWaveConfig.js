import Flutterwave from 'flutterwave-node-v3'

let flwInstance = null

export const getFlw = () => {
  if (flwInstance) return flwInstance

  if (!process.env.FLW_PUBLIC_KEY || !process.env.FLW_SECRET_KEY) {
    throw new Error('Flutterwave keys are missing from environment variables')
  }

  flwInstance = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY)
  return flwInstance
}