export interface Cliente {
  id?: number;
  placa?: string;
  chassi?: string;
  renavam?: number;
  anoFabricacao?: number;
  tipoCategoria?: number;
  qtdPassageirosVcl?: number;
  capacidadeTanque?: number;
  tipoCombustivel?: string;
  tombo?: string;
  orgaoLotacao?: number;
  orgaoSublotacao?: number;
  siglaLotacao?: string;
  siglaSublotacao?: string;
  consumoCombustivel?: number;
  estadoConservacao?: number;
  notaFiscalId?: number;
  codPropriedade?: number;
  statusVeiculo?: number;
  quilometragemInicial?: number;
  dataDeCompra?: Date;
  valorCompra?: number;
  empresaRevendedora?: string;
  codApropriacao?: number;
  codMarcaModelo?: number;
  seqMarcaModelo?: number;
  descricaoMarcaModelo?: string;
  potencia?: number;
  cilindrada?: number;
  cor?: number;
  descricaoCor?: string;
  tipoVeiculo?: string;
  quantidadePassageiros?: number;

  //dados detran
  cod_tipo_vcl?: string;
  cod_renavam_vcl?: number;
  cod_cor_vcl?: number;
  desc_cor?: string;
  cod_marca_modelo_vcl?: number;
  desc_marca_modelo?: string;
  num_chassi_vcl?: string;
  num_potencia_vcl?: string;
  num_cilindradas_vcl?: number;
  cod_combustivel_vcl?: string;
  ano_fabricacao_vcl?: number;
  cod_categoria_vcl?: number;
  qtd_passageiros_vcl?: number;
  marcaModeloDTO?: MarcaModeloDTO;
  notaFiscal: NotaFiscalDTO;

}

export interface MarcaModeloDTO {
  id?: number;
  codigo?: number;
  nome?: string;
  tipoCombustivel?: string;
  tipoVeiculo?: string;
  cilindrada?: number;
  potencia?: number;
}

export interface NotaFiscalDTO {
  id?: number;
  dataEmissao?: number;  // Representando a data como timestamp (milissegundos desde 01/01/1970)
  numero?: number;
  valor?: number;
  numeroDanfe?: string;
  cnpjEmitente?: string;
  razaoSocial?: string;
  ufEmitente?: string;
  descricao?: string;
  valorIcmsDesonerado?: number;
}
