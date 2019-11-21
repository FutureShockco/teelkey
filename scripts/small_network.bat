@echo off
::src path
cd "C:\Users\hight\Desktop\teelkey\src"
start cmd /C node cli.js account 26h9iSVNVBNYrMrzX2YPRWszA3AgQkkMyqcgytzS9qyGB hightouch -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js account 21S5YkkJjgatoDdAFYS2KAdjfHXkUu3VESNdCZnTqjwBn mimee -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js account h6VXTMh5V37gKPtzvVYyPyjZNiDKnXqr3LEtZXyq5wUQ birdinc -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js account mfjcJWhuMQLyh2WbxA4nJ12kf5CQLAHHEvkyEje8yBa3 heimindanger -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js account ntnXyhwovAAbwb2n3sBsgmmt7FXxYV6DptDttWc8HYKc shin -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js account rBUbgTar9ACaLMmiZjZDejeene9pHDitnPkrC2amCKid goyard -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js account rKvVWs2Kct84nrbjgxthAEfD5LrQzt3vDqiapioyE4w2 burak -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master


echo %time%
timeout 5 > NUL
echo %time%
start cmd /C node cli.js transfer hightouch 100000 -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer mimee 100000 -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer birdinc 100000 -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer heimindanger 100000 -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer shin 100000 -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer goyard 100000 -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer burak 100000 -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master

echo %time%
timeout 3 > NUL
echo %time%
start cmd /C node cli.js transfer-asset hightouch 100000 DWD -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset mimee 100000 DWD -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset birdinc 100000 DWD -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset heimindanger 100000 DWD -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset shin 100000 DWD -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset goyard 100000 DWD -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset burak 100000 DWD -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master

start cmd /C node cli.js transfer-asset hightouch 100000 BTC -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset mimee 100000 BTC -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset birdinc 100000 BTC -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset heimindanger 100000 BTC -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset shin 100000 BTC -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset goyard 100000 BTC -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset burak 100000 BTC -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master

start cmd /C node cli.js transfer-asset hightouch 100000 ETH -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset mimee 100000 ETH -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset birdinc 100000 ETH -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset heimindanger 100000 ETH -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset shin 100000 ETH -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset goyard 100000 ETH -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-asset burak 100000 ETH -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master

echo %time%
timeout 3 > NUL
echo %time%
start cmd /C node cli.js transfer-nft hightouch somethingreallyuniqueforhightouch -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft mimee somethingreallyuniqueformimee -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft birdinc somethingreallyuniqueforbirdinc -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft heimindanger somethingreallyuniqueforheimindanger -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft shin somethingreallyuniqueforshin -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft goyard somethingreallyuniqueforgoyard -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft burak somethingreallyuniqueforburak -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master

echo %time%
timeout 3 > NUL
echo %time%
start cmd /C node cli.js transfer-nft hightouch somethingelsereallyuniqueforhightouch -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft mimee somethingelsereallyuniqueformimee -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft birdinc somethingelsereallyuniqueforbirdinc -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft heimindanger somethingelsereallyuniqueforheimindanger -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft shin somethingelsereallyuniqueforshin -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft goyard somethingelsereallyuniqueforgoyard -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master
start cmd /C node cli.js transfer-nft burak somethingelsereallyuniqueforburak -K 8tRLEKnKPhQrbFQQ57bhSi2NT2Ln1xPqCAX5qH7vYd5s -M master

