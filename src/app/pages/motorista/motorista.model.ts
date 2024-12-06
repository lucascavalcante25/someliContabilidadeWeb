import { AfastamentoModel } from "./motorista-afastamento.model";
import { Pessoa } from "./pessoa.model";

export interface Motorista {
  cpf: string;
  ativo?: boolean;
  push(resposta: Motorista);
  id: number;
  matricula: string;
  codCategoriaCnh: number;
  staMotorista: number;
  cnh: string;
  validadeCnh: Date;
  orgaoLotacao: number;
  orgaoSublotacao: number;
  numTelefone: string;
  pessoa: Pessoa;
  situacaoCnh: string;
  siglaLotacao: string;
  siglaSublotacao: string;
  motoristaAfastamento?: AfastamentoModel;
}
