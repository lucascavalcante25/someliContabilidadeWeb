export interface VistoriaSolicitacaoDTO {
  id?: number;  
  solicitacaoServico: number;
  motorista: number;
  staAprovacao: number;
  dscObservacaoVistoria: string;
  dscServicoVistoria: string;
  codUsuarioVistoria?: string;
  datVistoria?: string; 
  vlrQuilometragem: number;
  seqPessoaFisicaJuridica: number;
  staEvento: number;
  justificativa: string;
  motoristaDTO?: number;
}