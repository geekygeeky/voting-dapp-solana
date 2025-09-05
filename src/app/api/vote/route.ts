import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"
import { BN, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";


import IDL from '@/../anchor/target/idl/voting.json';
import { Voting } from '@/../anchor/target/types/voting'

export const OPTIONS = GET;

export async function GET(_: Request) {
    const actionMetadata: ActionGetResponse = {
        icon: "",
        title: "",
        description: "",
        label: "",
        links: {
            actions: [
                {
                    type: "transaction",
                    href: "",
                    label: ""
                }
            ]
        }
    }
    return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(req: Request) {
    const url = new URL(req.url);
    const candidate = url.searchParams.get('candidate');
    if (!candidate) {
        return Response.json('Invalid candidate', { headers: ACTIONS_CORS_HEADERS })
    }

    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    const body: ActionPostRequest = await req.json();
    const transactionType = body.type;
    let voter: PublicKey;

    if (!transactionType) {
        return new Response('Invalid transaction', { status: 400, headers: ACTIONS_CORS_HEADERS })
    }


    if (transactionType !== 'transaction') {
        return new Response('Invalid transaction', { status: 400, headers: ACTIONS_CORS_HEADERS })
    }

    try {
        voter = new PublicKey(body.account);
    } catch (e) {
        return new Response('Invalid account', { status: 400, headers: ACTIONS_CORS_HEADERS })
    }

    const program: Program<Voting> = new Program(IDL, { connection });

    const instruction = await program.methods.vote(candidate, new BN(1)).accounts({ signer: voter }).instruction();

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const transaction = new Transaction({ feePayer: voter, blockhash, lastValidBlockHeight }).add(instruction);

    const response = await createPostResponse({
        fields: {
            transaction,
            type: transactionType
        }
    })
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS })

}