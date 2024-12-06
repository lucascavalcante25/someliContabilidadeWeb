import { Motorista } from "../motorista/motorista.model";

export interface VeiculoMotoristaHistorico {
    id: number;
    veiculoId: number;
    veiculoPlaca: string;
    inicioVinculacao: string;
    fimVinculacao: string | null; 
    motorista: Motorista;
    nomeMotorista: string;
}
