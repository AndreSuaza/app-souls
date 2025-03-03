
export interface Tournament {
    id: string;
    title: string;  
    descripcion: string;
    url: string;
    lat: number;
    lgn: number;
    price: number;
    format: string;
    date: Date;
    createDate: Date;
    TournamentImage: TournamentImage[];
    typeTournament: TypeTournament;
    store: StoreTournament
  } 


export interface TournamentImage {
    id: string;
    url: string;
    alt: string;
}

export interface TypeTournament {
    id: string;
    name: string;
}

export interface StoreTournament {
    id: string,
    name: string,     
    lat: number,
    lgn: number
}