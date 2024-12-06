export class ClientePlaca {
    id: number;
    placa: string;
    chassi: string;
    renavam: number;
    anoFabricacao: number;
    codMarcaModelo: number;
    tipoCategoria: number;
    propriedade: number;
    quantidadePassageiros: number;
    capacidadeTanque: number;
    tipoCombustivel: number;
    tombo: string;
    orgaoLotacao: number;
    orgaoSublotacao: number;
    consumoCombustivel: string;  // Alterado de number para string
    estadoConservacao: number;
    notaFiscalId: number;
    sistemaFreio: number;
    statusVeiculo: number;
    quilometragemInicial: number;
    dataDeCompra: Date;
    valorCompra: number;
    empresaRevendedora: string;
    codApropriacao: number;
    seqMarcaModelo: number;
    seqTipoVeiculo: number;
    seqCor: number;
  
    // Campos adicionais que podem ser retornados pela API
  
    
    cod_tipo_vcl?: number;
    cod_renavam_vcl?: number;
    cod_cor_vcl?: number;
    desc_cor?: string;
    cod_marca_modelo_vcl?: number;
    desc_marca_modelo?: string;
    num_chassi_vcl?: string;
    num_potencia_vcl?: number;
    num_cilindradas_vcl?: number;
    cod_combustivel_vcl?: number;
    ano_fabricacao_vcl?: number;
    cod_categoria_vcl?: number;
    qtd_passageiros_vcl?: number;
    cod_propriedade_vcl?: number;
    cod_orgao_lotacao_vcl?: number;
    cod_orgao_sublotacao_vcl?: number;
    val_compra?: number;
    // cod_placa_vcl?: string;
  }
  
  