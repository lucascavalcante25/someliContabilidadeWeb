import { NotaFiscalEquipamentoDTO } from "./nota.model";
import { Cor } from "./cor.model";

export interface Equipamento {
  notaFiscal(notaFiscal: any): unknown;
  id: number;
  identificador: string;
  anoFabricacao: number;
  tipoCombustivel: number;
  tombo: string;
  orgaoLotacao: number;
  orgaoSublotacao: number;
  estadoConservacao: number;
  tipoEquipamento: number;
  siglaLotacao: string;
  siglaSubLotacao: string;
  descricaoEquipamento: string;

  notaFiscalEquipamentoDTO: NotaFiscalEquipamentoDTO;
  cor: Cor;
}
