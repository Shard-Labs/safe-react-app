// @ts-ignore
import React, { FC, useState, ChangeEvent } from 'react';
import { fetchFiles } from './services/fileService';
import { MetadataContentOutput, Method, MetadataContent } from './types';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Card,
  Container,
  CircularProgress
} from '@material-ui/core';
import Web3 from 'web3';
import { getMethodName } from './utils';
import useStyles from './styles';

interface Error {
  addressInput?: string;
  result?: string;
}

const App: FC = () => {
  const [methods, setMethods] = useState<null | Array<any>>(null);
  const [abi, setAbi] = useState<null | Array<any>>(null);
  const [selectedMethod, setSelectedMethod] = useState<null | Method>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [inputValues, setInputValues] = useState<{}>({});
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const classes = useStyles();

  const handleFetchFiles = async (contractAddress: string) => {
    // get metadata.json and .sol
    setLoading(true);
    const response = await fetchFiles(contractAddress);
    const metadataFileContent: MetadataContent = JSON.parse(response.data[0].content);
    const metadataFileContentOutput: MetadataContentOutput = metadataFileContent.output;
    const abi = metadataFileContentOutput.abi;

    setAbi(abi);

    const devDoc = metadataFileContentOutput.devdoc;

    const methodsWithDocumentation: any[] = [];

    for (const [key, value] of Object.entries(devDoc.methods)) {
      abi.forEach((method) => {
        // @ts-ignore
        if (method.name === key.split('(')[0]) {
          methodsWithDocumentation.push({ documentation: { ...value }, ...method });
        }
      });
    }

    setMethods(methodsWithDocumentation);
    setSelectedMethod(methodsWithDocumentation[0]);

    // Set input state properties
    let obj = {};
    methodsWithDocumentation[0].inputs.forEach((prop) => {
      obj = {
        ...obj,
        [prop.name]: null
      };
    });

    setInputValues(obj);

    setLoading(false);
  };

  const sendTransaction = async () => {
    // @ts-ignore
    await window.ethereum.enable();

    const web3 = new Web3(Web3.givenProvider);

    // @ts-ignore
    const contract = new web3.eth.Contract(abi, address);

    const accounts = await web3.eth.getAccounts();

    let fnc = getMethodName(selectedMethod?.stateMutability);

    try {
      // @ts-ignore
      const response = await contract.methods[selectedMethod?.name]
        .apply(null, Object.values(inputValues))
        [fnc]({ from: accounts[0] });

      setError(null);
      setResponse(response);
    } catch (e) {
      setError({ result: 'Provide valid input/s values and try again!' });
    }
  };

  const handleMethodSelect = (e: ChangeEvent<any>) => {
    const { value } = e.target;

    setSelectedMethod(value);
    setResponse(null);
    setError(null);
    setInputValues({});

    // Set input state properties
    let obj = {};
    value.inputs.forEach((prop) => {
      obj = {
        ...obj,
        [prop.name]: null
      };
    });

    setInputValues(obj);
  };

  const handleMethodInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setInputValues({
      ...inputValues,
      [name]: value
    });
  };

  const handleAddressInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setAddress(value);

    if (Web3.utils.isAddress(value)) {
      setError(null);
      await handleFetchFiles(value);
    } else {
      setError({
        addressInput: 'Invalid address!'
      });
    }
  };

  return (
    <Container maxWidth="sm" className="App">
      <Card className={classes.card}>
        {/* INTRO */}
        <Typography variant="h5" color="primary" gutterBottom>
          Transaction Constructor
        </Typography>
        <Typography variant="body2" gutterBottom>
          Use this app to construct custom transaction. Enter a Ethereum contract address to get
          started.
        </Typography>

        {/* ADDRESS INPUT */}
        <div className={classes.contractAddressWrapper}>
          <TextField
            error={!!error?.addressInput}
            helperText={error?.addressInput}
            fullWidth
            id="standard-read-only-input"
            variant="outlined"
            label="Contract Address"
            onChange={handleAddressInput}
            value={address}
          />
          {loading && <CircularProgress className={classes.loader} size={30} />}
        </div>

        {/* FORM */}
        {methods && selectedMethod && (
          <>
            <Typography variant="h6" gutterBottom>
              Transaction Information
            </Typography>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="demo-simple-select-outlined-label">Methods</InputLabel>
              <Select
                fullWidth
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={selectedMethod}
                label="Methods"
                onChange={handleMethodSelect}>
                {methods.map((method: any, index: number) => (
                  <MenuItem value={method} key={`${method.name}#${index}`}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* DESCRIPTION */}
            {selectedMethod.documentation.details && (
              <div className={classes.descriptionWrapper}>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedMethod.documentation.details}
                </Typography>
              </div>
            )}

            {/* INPUTS */}
            {selectedMethod.inputs.length > 0 && (
              <div className={classes.methodsWrapper}>
                <Typography variant="subtitle2" gutterBottom>
                  Inputs
                </Typography>
                {selectedMethod.inputs.map((input: any, index: number) => (
                  <div className={classes.methodParamWrapper} key={`${input.name}#${index}`}>
                    <TextField
                      fullWidth
                      id="yes"
                      variant="outlined"
                      name={input.name}
                      onChange={handleMethodInputChange}
                      label={`${input.name} (${input.type})`}
                    />
                    <Typography variant="caption" gutterBottom>
                      {selectedMethod.documentation.params[input.name]}
                    </Typography>
                  </div>
                ))}
              </div>
            )}

            {/* MESSAGES */}
            {error && (
              <Typography className={classes.errorMsg} variant="subtitle2" gutterBottom>
                {error.result}
              </Typography>
            )}

            {/* MESSAGES */}
            {response && (
              <div className={classes.responseWrapper}>
                <Typography variant="subtitle2" gutterBottom>
                  Result
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  {response}
                </Typography>
              </div>
            )}

            {/*  SEND TRANSACTION */}
            <Button
              className={classes.transactionBtn}
              variant="contained"
              color="primary"
              fullWidth
              onClick={sendTransaction}>
              SEND TRANSACTION
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
};

export default App;
