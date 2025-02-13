'use client';

import Image from "next/image";
import {useEffect, useState} from "react";
import {SendTransactionResponse, TonConnectUI} from "@tonconnect/ui";
import {Button} from "@/components/ui/button";
import {SendTransactionRequest} from "@tonconnect/sdk";
import {Cell} from "@ton/core";

export default function Home() {

    const [tonConnect, setTonConnect] = useState<TonConnectUI>();
    const [tx, setTx] = useState<SendTransactionResponse>();

    useEffect(() => {
        const rawTonConnect = new TonConnectUI({
            manifestUrl: 'https://trc404web.pages.dev/tonconnect-manifest.json',
            buttonRootId: 'ton-connect'
        });
        setTonConnect(rawTonConnect);
        console.info(rawTonConnect);
    }, [])

    function printTonInfo() {
        console.info(tonConnect);
    }

    async function sendToncoin() {

        if (!tonConnect?.connected) {
            alert("Connect wallet first")
            return;
        }

        const validDate = new Date();
        validDate.setMinutes(validDate.getMinutes() + 5);
        const txRequest: SendTransactionRequest = {
            // 秒级时间戳
            validUntil: validDate.getTime() / 1000,
            messages: [{
                address: "0QA_XoUfrerc2eJwW62L9U7ZW_BjA6VUWTQec3UrisOqhBlV",
                amount: "10000000" //Toncoin in nanotons
            }]
        }

        const result = await tonConnect?.sendTransaction(txRequest);
        const cell = Cell.fromBase64(result.boc);
        const hashBuffer = cell.hash();
        const signedTxHashHex = cell.hash().toString('hex');
        const signedTxHashBase64 = hashBuffer.toString('base64');
        console.info(signedTxHashHex); //e.g. 55ce653a1198d44f7d89bb79f817519d785eae53090e70dd2d13a5a2b6c5cfc1
        console.info(signedTxHashBase64); //e.g. zEHq3S/XsUhCk6ylnZ+Gs3Sg01Fb+4XXLVHzpZyWykI=  Mainnet:IrNcyIG+UpojVPYwrPunpFd7f9N36RpAGBYPWyquODc=

        // 浏览器查询 signedTxHashHex
        //Testnet tonviewer: https://testnet.tonviewer.com/transaction/55ce653a1198d44f7d89bb79f817519d785eae53090e70dd2d13a5a2b6c5cfc1
        //Mainnet tonviewer: https://tonviewer.com/transaction/0e9a140a236be86bedff69af0df1ecb37f7191e684200e569cb61a5d90eb1f2f

        //API
        // 1. tonapi
        // https://tonapi.io/api-v2#operations-Traces-getTrace
        // 使用 trace_id = signedTxHashHex 进行精准查询

        // 2. TONX API
        // https://docs.tonxapi.com/reference/get-messages
        // 通过 hash = signedTxHashBase64 进行精准查询

        //2. TON API v3
        // https://testnet.toncenter.com/api/v3/index.html#/actions/api_v3_get_traces
        // 使用交易发起方的 account 查询最近交易
        // 在查询结果中通过 external_hash = signedTxHashBase64 = in_msg_hash 进行过滤




    }

    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <div id="ton-connect"></div>
                <div>{tonConnect?.account?.address}</div>
                <Button onClick={printTonInfo}>Print TON Connect Info</Button>
                <Button onClick={sendToncoin}>Send Toncoin</Button>
            </main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src="/file.svg"
                        alt="File icon"
                        width={16}
                        height={16}
                    />
                    Learn
                </a>
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src="/window.svg"
                        alt="Window icon"
                        width={16}
                        height={16}
                    />
                    Examples
                </a>
                <a
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src="/globe.svg"
                        alt="Globe icon"
                        width={16}
                        height={16}
                    />
                    Go to nextjs.org →
                </a>
            </footer>
        </div>
    );
}
