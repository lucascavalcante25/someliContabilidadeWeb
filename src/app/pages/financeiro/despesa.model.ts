export interface Despesa {
    diaPagamento: any;
    id?: number;
    descricao: string;
    valorMensal: number;
    tipo: number;
    parcelas?: number; // apenas para pontuais
    dataInicio: string; // ISO string yyyy-MM-dd
    ativa: boolean;
  }
  