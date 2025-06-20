"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TonConnectUI } from "@tonconnect/ui";
import { Button } from "@/components/ui/button";
import { SendTransactionRequest } from "@tonconnect/sdk";
import { Address, beginCell, Cell, toNano } from "@ton/core";

export default function Home() {
  const [tonConnect, setTonConnect] = useState<TonConnectUI>();
  // const [tx, setTx] = useState<SendTransactionResponse>();

  useEffect(() => {
    const rawTonConnect = new TonConnectUI({
      manifestUrl: "https://open-mini-app.pages.dev/tonconnect-manifest.json",
      buttonRootId: "ton-connect",
    });
    setTonConnect(rawTonConnect);
    console.info(rawTonConnect);
  }, []);

  function printTonInfo() {
    console.info(tonConnect);
  }

  async function sendToncoin() {
    if (!tonConnect?.connected) {
      alert("Connect wallet first");
      return;
    }

    const validDate = new Date();
    validDate.setMinutes(validDate.getMinutes() + 5);
    const payload = beginCell()
      .storeUint(0, 32)
      .storeStringTail("按照这个格式加备注")
      .endCell();
    const txRequest: SendTransactionRequest = {
      // 秒级时间戳
      validUntil: validDate.getTime() / 1000,
      messages: [
        {
          address: "0QA_XoUfrerc2eJwW62L9U7ZW_BjA6VUWTQec3UrisOqhBlV",
          amount: "10000000", //Toncoin in nanotons
          payload: payload.toBoc().toString("base64"),
        },

        {
          address: "0QAAQ3X8LZ3qmwnIgaXwgysWnBBBE8T26G8B4iQ4-PHDGHQC",
          amount: "40000000", //Toncoin in nanotons
        },
        {
          address: "0QAAQ3X8LZ3qmwnIgaXwgysWnBBBE8T26G8B4iQ4-PHDGHQC",
          amount: "50000000", //Toncoin in nanotons
        },
      ],
    };

    const result = await tonConnect?.sendTransaction(txRequest);
    const cell = Cell.fromBase64(result.boc);
    const hashBuffer = cell.hash();
    const extMsgHashHex = cell.hash().toString("hex");
    const extMsgHashBase64 = hashBuffer.toString("base64");
    console.info(extMsgHashHex); //e.g. 55ce653a1198d44f7d89bb79f817519d785eae53090e70dd2d13a5a2b6c5cfc1
    console.info(extMsgHashBase64); //e.g. zEHq3S/XsUhCk6ylnZ+Gs3Sg01Fb+4XXLVHzpZyWykI=  Mainnet:IrNcyIG+UpojVPYwrPunpFd7f9N36RpAGBYPWyquODc=

    // 浏览器查询 extMsgHashHex, 这里 tonviewer 应该做了特殊处理，把 extMsgHashHex 对应的 transaction 查询处理展示
    //Testnet tonviewer: https://testnet.tonviewer.com/transaction/55ce653a1198d44f7d89bb79f817519d785eae53090e70dd2d13a5a2b6c5cfc1
    //Mainnet tonviewer: https://tonviewer.com/transaction/0e9a140a236be86bedff69af0df1ecb37f7191e684200e569cb61a5d90eb1f2f

    //API
    // 1. tonapi
    // https://tonapi.io/api-v2#operations-Traces-getTrace
    // 使用 trace_id = extMsgHashHex 进行精准查询

    // 2. TONX API
    // https://docs.tonxapi.com/reference/get-messages
    // 通过 hash = extMsgHashBase64 进行精准查询

    //2. TON API v3
    // https://testnet.toncenter.com/api/v3/index.html#/actions/api_v3_get_traces
    // 通过 msg_hash = extMsgHashHex 进行精准查询, 结果集中字段是 external_hash （external_msg_hash）
  }

  async function sendJetton6USDT_no_forwaed_payload() {
    if (!tonConnect?.connected) {
      alert("Connect wallet first");
      return;
    }

    const Wallet_DST = "0QA_XoUfrerc2eJwW62L9U7ZW_BjA6VUWTQec3UrisOqhBlV";
    const Wallet_SRC = "0QAAQ3X8LZ3qmwnIgaXwgysWnBBBE8T26G8B4iQ4-PHDGHQC";

    const bodyWithoutComments = beginCell()
      .storeUint(0xf8a7ea5, 32) // jetton transfer op code
      .storeUint(0, 64) // query_id:uint64
      // toNano("0.006") 表示 6 USDT。因为 USDT 使用 6 位小数精度，而 toNano 函数默认使用 9 位小数精度，
      .storeCoins(toNano("0.006")) // amount:(VarUInteger 16) -  Jetton amount for transfer (decimals = 6 - USDT, 9 - default). Function toNano use decimals = 9 (remember it)
      .storeAddress(Address.parse(Wallet_DST)) // destination:MsgAddress
      .storeAddress(Address.parse(Wallet_SRC)) // response_destination:MsgAddress
      .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
      .storeCoins(toNano("0.1")) // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
      .storeUint(0, 1) // forward_payload:(Either Cell ^Cell)
      .endCell();

    const jettonWalletContract =
      "kQDP4wFEMdUT1BqzReE1iRClDyV-0ezpJBfZZgYMTqe3gsSM";

    const myTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: jettonWalletContract, // sender jetton wallet
          amount: toNano("0.9").toString(), // for commission fees, excess will be returned
          payload: bodyWithoutComments.toBoc().toString("base64"), // payload with jetton transfer body
        },
      ],
    };

    const result = await tonConnect?.sendTransaction(myTransaction);
    console.info(result);
  }

  async function sendJetton8USDT_with_forward_payload() {
    if (!tonConnect?.connected) {
      alert("Connect wallet first");
      return;
    }

    const Wallet_DST = "0QA_XoUfrerc2eJwW62L9U7ZW_BjA6VUWTQec3UrisOqhBlV";
    const Wallet_SRC = "0QAAQ3X8LZ3qmwnIgaXwgysWnBBBE8T26G8B4iQ4-PHDGHQC";

    // ==================选项 2：加上 forward_payload ================================================
    const builder = beginCell()
      .storeUint(0xf8a7ea5, 32) // jetton transfer op code
      .storeUint(0, 64) // query_id:uint64
      // toNano("0.008") 表示 8 USDT。因为 USDT 使用 6 位小数精度，而 toNano 函数默认使用 9 位小数精度，
      .storeCoins(toNano("0.008")) // amount:(VarUInteger 16) -  Jetton amount for transfer (decimals = 6 - USDT, 9 - default). Function toNano use decimals = 9 (remember it)
      .storeAddress(Address.parse(Wallet_DST)) // destination:MsgAddress
      .storeAddress(Address.parse(Wallet_SRC)) // response_destination:MsgAddress
      .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
      .storeCoins(toNano("0.1")) // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
      .storeUint(0, 1); // forward_payload:(Either Cell ^Cell)

    const fwdPayloadCell = beginCell()
      .storeUint(0, 32)
      .storeStringTail("12345")
      .endCell();
    builder.storeBit(true).storeRef(fwdPayloadCell);
    // ==================================================================

    const jettonWalletContract =
      "kQDP4wFEMdUT1BqzReE1iRClDyV-0ezpJBfZZgYMTqe3gsSM";

    const myTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: jettonWalletContract, // sender jetton wallet
          amount: toNano("0.9").toString(), // for commission fees, excess will be returned
          // payload: bodyWithoutComments.toBoc().toString("base64"), // payload with jetton transfer body
          payload: builder.endCell().toBoc().toString("base64"), // payload with jetton transfer body
        },
      ],
    };

    const result = await tonConnect?.sendTransaction(myTransaction);
    console.info(result);
  }

  // MCP  test
  // async function checkBalance() {
  //   const address = "EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbdLIYI";
  //   try {
  //     const response = await fetch(
  //       `https://ton-api-mcp-server.fly.dev/api/v1/account/${address}`,
  //     );
  //     const data = await response.json();
  //     console.info("钱包余额：", data.balance / 1e9, "TON");
  //     alert(`钱包余额：${data.balance / 1e9} TON`);
  //   } catch (error) {
  //     console.error("查询余额失败：", error);
  //     alert("查询余额失败");
  //   }
  // }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div id="ton-connect"></div>

        <div>
          <a href="https://bbmax.onelink.me/">不常见URL</a>
          <br />
          <a href="https://x.com/">Twitter</a>
          <br />
          <a href="https://google.com/">Google</a>
          <br />
          <a href="https://telegram.org/">Telegram Website</a>
        </div>

        <Button onClick={printTonInfo}>Print TON Connect Info</Button>
        <Button onClick={sendToncoin}>Send Toncoin</Button>
        <Button onClick={sendJetton6USDT_no_forwaed_payload}>
          Send 6 USDT 没有 Forward Payload
        </Button>
        <Button onClick={sendJetton8USDT_with_forward_payload}>
          Send 8 USDT 有 Forward Payload 12345
        </Button>
        {/*<Button onClick={checkBalance}>查询余额</Button>*/}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://docs.ton.org/v3/guidelines/ton-connect/guidelines/how-ton-connect-works"
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
          How TON Connect works
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/ton-blockchain/ton-connect"
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
          TON Connect Github
        </Link>
      </footer>
    </div>
  );
}
