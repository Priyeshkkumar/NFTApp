import React, { useEffect, useState } from "react";
import contract from "./contractABI.json";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { ethers } from "ethers";
import axios from "axios";

const App = () => {
  const contractAddress = "0x2C43602431b1C302d5eeA81Dea9F15303265bb7b";
  const contractABI = contract.abi;
  const [web3Account, setWeb3Account] = useState(null);
  const [name, setName] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [description, setDescription] = useState("");

  const headers = {
    "Content-Type": "multipart/form-data",
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGU5YTM4M2EyNjNiMjBBY0IwYzYxYjU4MDEzYzE4ODI4ZjExYzQzMDYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3OTUxNDk4OTgxOCwibmFtZSI6IkRlbW8ifQ.sfxsDoBRGmxdp7D8ehBWvvEfBo-c8hBRrNQawzWI0G4",
  };

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setWeb3Account(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const mintNftHandler = async () => {
    const data = {
      name: name,
      image: imagePath,
      description: description,
    };

    const formData = new FormData();
    formData.append("meta", JSON.stringify(data));

    let tokenURI = null;

    axios
      .post("https://api.nft.storage/store", formData, {
        headers: headers,
      })
      .then(async (response) => {
        console.log(response);
        tokenURI = response.data.value.url;
        console.log(response.data.value.url);
        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const nftContract = new ethers.Contract(
              contractAddress,
              contractABI,
              signer
            );

            console.log("Initialize payment", web3Account, tokenURI);
            let nftTxn = await nftContract.safeMint(web3Account, tokenURI);

            console.log("Mining... please wait");
            await nftTxn.wait();

            console.log("Minting");
          } else {
            console.log("Ethereum object does not exist");
          }
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Wallet not found");
    } else {
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Found account", accounts[0]);
        setWeb3Account(accounts[0]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <Container
      sx={{
        marginTop: " 50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      maxWidth="sm"
    >
      <Button onClick={connectWalletHandler} variant="contained">
        Connect Wallet
      </Button>
      {web3Account !== null && (
        <>
          <Box component="span" sx={{ p: 2, border: "1px dashed grey" }}>
            <div>Wallet Address: {web3Account}</div>
          </Box>
          <Box
            component="span"
            sx={{ p: 2, border: "1px dashed grey", marginTop: "20px" }}
          >
            <Container
              sx={{
                alignItems: "center",
                marginTop: " 10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <b>Enter NFT metadata</b>
              <Stack spacing={2}>
                <TextField
                  sx={{
                    marginTop: "10px",
                  }}
                  id="outlined-controlled"
                  label="Name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                />
                <TextField
                  sx={{
                    marginTop: "10px",
                  }}
                  id="outlined-controlled"
                  label="Image Path"
                  value={imagePath}
                  onChange={(event) => {
                    setImagePath(event.target.value);
                  }}
                />
                <TextField
                  sx={{
                    marginTop: "10px",
                  }}
                  id="outlined-controlled"
                  label="Description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                  }}
                />
              </Stack>
              <Button
                onClick={mintNftHandler}
                sx={{ width: "100%", marginTop: "20px" }}
                variant="contained"
              >
                Mint NFT
              </Button>
            </Container>
          </Box>
        </>
      )}
    </Container>
  );
};

export default App;
