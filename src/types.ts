export interface DevDoc {
  methods: object;
}

export interface MetadataContentOutput {
  abi: object[];
  devdoc: DevDoc;
  userdoc: object;
}

export interface MetadataContent {
  compiler: object;
  language: string;
  output: MetadataContentOutput;
  settings: object;
  sources: object;
  version: number;
}

export interface Method {
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