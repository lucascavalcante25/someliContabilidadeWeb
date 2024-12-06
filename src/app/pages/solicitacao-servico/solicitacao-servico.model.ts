export interface SolicitacaoServico {
  id?: number;
  idVeiculo?: number;
  placa: string;
  dataSolicitacao?: string;
  descricaoSolicitacao?: string;
  usuarioSolicitanteId?: string;
  dataUltimaAtualizacao?: string;
  usuarioUltimaAtualizacaoId?: number;
  tipoManutencao?: string;
  orgaoLotacaoId?: number;
  orgaoSublotacaoId?: number;
  statusSolicitacaoServico?: number;
  siglaLotacao?: string;
  siglaSublotacao?: string;
  staEvento: number;
  vistoria?: string;

}
