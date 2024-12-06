export interface Pessoa {
  seqPessoa?: number;
  codigoPessoa?: number;
  tipoPessoa?: number;
  descricaoTipoPessoa?: string;
  nome?: string;
  identidade?: string;
  numeroCnh?: string;
  cep?: number;
  logradouro?: string;
  numLogradouro?: string;
  complemento?: string;
  bairro?: string;
  codMunicipio?: number;
  nomeMunicipio?: string;
  codUF?: number;
  nomeUF?: string;
  siglaUF?: string;
  telefone?: string;
  telefone2?: string;
  email?: string;
  statusEmissao?: string;
  statusEmissaoNFE?: string;
  inclusaoOracle?: number;
  dataInclusao?: Date;
  dataAtualizacao?: Date;
  lotacao?: number;
  sublotacao?: number;
  validadeCnh?: Date;
  siglaLotacao?: string;  // Adicionado
  siglaSublotacao?: string; // Adicionado
}