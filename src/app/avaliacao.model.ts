export interface Avaliacao {
    userId: string;
    nome: string;
    foto?: string | null;
    livro: {
      titulo: string;
      autor: string;
      capa: string;
    };
    reviewText: string;
    rating: number;
    timestamp: any;
  }
  