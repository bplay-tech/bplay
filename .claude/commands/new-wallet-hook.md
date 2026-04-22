# /new-wallet-hook

Scaffold a typed wagmi hook for a wallet interaction.

## Arguments
`$ARGUMENTS` — hook purpose in kebab-case (e.g. `read-token-balance`, `send-transfer`)

## Steps

1. Determine interaction type from the name:
   - `read-*` → uses `useReadContract`
   - `write-*` / `send-*` → uses `useWriteContract` + `useWaitForTransactionReceipt`
   - `sign-*` → uses `useSignMessage` or `useSignTypedData`

2. Create `features/<domain>/hooks/use-$ARGUMENTS.ts`:
   - Import contract ABI from `lib/abis/` (create the ABI file if needed)
   - Import chain config from `lib/wagmi.ts`
   - Export a single hook function `use$Name()`
   - Return typed `{ data, isLoading, isError, error, <action> }` shape
   - Guard against `!address` before any call

3. Add contract address to `lib/contracts.ts` keyed by chain ID — never hardcode inline.

4. Add Zod validation for any inputs the hook receives.

5. Write a simple usage example as a JSDoc comment on the hook.
