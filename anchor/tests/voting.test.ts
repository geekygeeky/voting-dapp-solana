import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { BankrunProvider, startAnchor } from 'anchor-bankrun-patched'
import type { ProgramTestContext } from 'solana-bankrun'

import { Voting } from '../target/types/voting'
import IDL from '../target/idl/voting.json'

const votingProgramId = new PublicKey('E8yamyDFQ5RPK6bd1NscbbvUavr7uhxLzRLpuyJnm3qd')

describe('voting', () => {

  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let votingProgram: Program<Voting>;


  beforeAll(async () => {

    context = await startAnchor('', [{ name: 'voting', programId: votingProgramId }], [])
    provider = new BankrunProvider(context)

    votingProgram = new Program<Voting>(IDL, provider)

  })

  it('Initialize Poll', async () => {

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1756885603),
        'What is your favorit peanut butter',
      )
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingProgramId
    );

    console.log(pollAddress);

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toContain('peanut butter')
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())

  })

  it('Initialize candidate', async () => {

    await votingProgram.methods.initializeCandidate('Rustlang', new anchor.BN(1)).rpc();
    await votingProgram.methods.initializeCandidate('JavaScript', new anchor.BN(1)).rpc();

    const [rustLangAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Rustlang')],
      votingProgramId
    );

    console.log(rustLangAddress);

    const rustLangCandidate = await votingProgram.account.candidate.fetch(rustLangAddress);
    console.log(rustLangCandidate);
    expect(rustLangCandidate.candidateVotes.toNumber()).toEqual(0)

    const [javascriptAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('JavaScript')],
      votingProgramId
    );

    const javascriptCandidate = await votingProgram.account.candidate.fetch(javascriptAddress)
    console.log(javascriptCandidate);
    expect(javascriptCandidate.candidateVotes.toNumber()).toEqual(0)

  })

  it('vote', async () => {
    let d = await votingProgram.methods.vote('Rustlang', new anchor.BN(1)).rpc()

    const [rustLangAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Rustlang')],
      votingProgramId
    );

    console.log(rustLangAddress);

    const rustLangCandidate = await votingProgram.account.candidate.fetch(rustLangAddress);
    console.log(rustLangCandidate);
    expect(rustLangCandidate.candidateVotes.toNumber()).toEqual(1)
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
