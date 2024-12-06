import { Motorista } from "../motorista/motorista.model";
import { Veiculo } from "../cliente/cliente-listar/cliente.model";

export interface VeiculoMotorista {
    id?: number;
    motoristaDTO?: Motorista;
    veiculo?: Veiculo;
    inicioVinculacao?: Date;
    fimVinculacao?: Date;
    codPlacaVeiculo?: String;
    codSubLotacaoVeiculo?: String;
    codSubLotacaoMotorista?: String;
}