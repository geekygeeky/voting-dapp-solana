import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { BankrunProvider, startAnchor as SA} from 'anchor-bankrun-patched'
import { startAnchor } from 'solana-bankrun'

import { Voting } from '../target/types/voting'
import IDL from '../target/idl/voting.json'

const votingProgramId = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS')

describe('voting', async () => {
  it('Initialize Poll', async () => {
    const context = await startAnchor('', [{ name: 'voting', programId: votingProgramId }], [])

    const provider = new BankrunProvider(context)

    const votingProgram = new Program<Voting>(IDL, provider)
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1756885603),
        'What is your favorit peanut butter',
      )
      .rpc()
  })
})

/*
describe('counter', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Counter as Program<Counter>

  const counterKeypair = Keypair.generate()

  it('Initialize Counter', async () => {
    await program.methods
      .initialize()
      .accounts({
        counter: counterKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([counterKeypair])
      .rpc()

    const currentCount = await program.account.counter.fetch(counterKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })
})
*/
