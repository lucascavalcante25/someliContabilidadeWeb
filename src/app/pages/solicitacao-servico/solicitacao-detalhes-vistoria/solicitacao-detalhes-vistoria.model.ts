import { Motorista } from "../../motorista/motorista.model";
import { Pessoa } from "../../motorista/pessoa.model";
import { Veiculo } from "../../cliente/cliente-listar/cliente.model";
import { VistoriaSolicitacaoDTO } from "../vistoriaSolicitacaoDTO.model";

export interface SolicitacaoServicoCompletaDTO {
  placa?: string;
  veiculo?: Veiculo;
  dataSolicitacao?: string; 
  descricaoSolicitacao?: string;
  usuarioSolicitanteId?: Pessoa;
  dataUltimaAtualizacao?: string; 
  usuarioUltimaAtualizacaoId?: Pessoa;
  tipoManutencao?: string;
  orgaoLotacaoId?: string;
  orgaoSublotacaoId?: string;
  statusSolicitacaoServico?: number;
  siglaLotacao?: string;
  siglaSublotacao?: string;
  motorista?: Motorista;
  vistoria?: VistoriaSolicitacaoDTO;
  

}
