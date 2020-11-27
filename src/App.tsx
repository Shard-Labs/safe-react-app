import { FC, useState } from 'react';
import { CONTRACT_ADDRESS, fetchFiles } from './fileService';
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
  makeStyles,
  CircularProgress
} from '@material-ui/core';

interface DevDoc {
  methods: object;
}

interface MetadataContentOutput {
  abi: object[];
  devdoc: DevDoc;
  userdoc: object;
}

interface MetadataContent {
  compiler: object;
  language: string;
  output: MetadataContentOutput;
  settings: object;
  sources: object;
  version: number;
}

interface Method {
  documentation: {
    params: Array<any>;
    details: string;
  };
  inputs: Array<{
    internalType: string;
    name: string;
    type: string;
  }>;
  name: string;
  outputs: Array<any>;
  stateMutability: string;
}

const useStyles = makeStyles({
  card: {
    padding: '1rem'
  },
  textInput: {
    marginBottom: '1rem'
  },
  descriptionWrapper: {
    marginTop: '1rem'
  },
  methodsWrapper: {
    marginTop: '1rem'
  },
  methodParamWrapper: {
    marginBottom: '1rem'
  }
});

const App: FC = () => {
  const [methods, setMethods] = useState<null | Array<any>>(null);
  const [selectedMethod, setSelectedMethod] = useState<null | Method>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const classes = useStyles();

  const handleFetchFiles = async () => {
    // get metadata.json and .sol
    setLoading(true);
    const response = await fetchFiles();

    const metadataFileContent: MetadataContent = JSON.parse(response.data[0].content);

    const metadataFileContentOutput: MetadataContentOutput = metadataFileContent.output;

    const abi = metadataFileContentOutput.abi;
    const devDoc = metadataFileContentOutput.devdoc;

    const met: any[] = [];

    for (const [key, value] of Object.entries(devDoc.methods)) {
      abi.forEach((a) => {
        // @ts-ignore
        if (a.name === key.split('(')[0]) {
          met.push({ documentation: { ...value }, ...a });
        }
      });
    }

    setMethods(met);
    setSelectedMethod(met[0]);

    setLoading(false);
  };

  const handleChange = (event: any) => {
    setSelectedMethod(event.target.value);
  };


  return (
    <Container maxWidth="sm" className="App">
      <Card className={classes.card}>
        <TextField
          className={classes.textInput}
          fullWidth
          id="standard-read-only-input"
          disabled
          variant="outlined"
          label="Contract Address"
          value={CONTRACT_ADDRESS}
        />
        {loading ? (
          <CircularProgress size={30} />
        ) : (
          <Button variant="outlined" color="primary" onClick={handleFetchFiles}>
            Get Methods
          </Button>
        )}

        {/* FORM */}
        {methods && selectedMethod && (
          <>
            <FormControl variant="outlined" style={{ display: 'block', marginTop: '2rem' }}>
              <InputLabel id="demo-simple-select-outlined-label">Methods</InputLabel>
              <Select
                fullWidth
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={selectedMethod}
                label="Methods"
                onChange={handleChange}>
                {methods.map((m) => (
                  <MenuItem value={m}>{m.name}</MenuItem>
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
                {selectedMethod.inputs.map((input: any) => (
                  <div className={classes.methodParamWrapper}>
                    <TextField
                      fullWidth
                      id="yes"
                      variant="outlined"
                      label={`${input.name} (${input.type})`}
                    />
                    <Typography variant="caption" gutterBottom>
                      {selectedMethod.documentation.params[input.name]}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </Container>
  );
};

export default App;
