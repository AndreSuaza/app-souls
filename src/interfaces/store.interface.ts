

export interface Store {
    id: string,
    name: string,     
    city: string,
    address: string,
    country: string,
    postalCode: string,
    phone: string,
    lat: number,
    lgn: number,
    url: string,
    createDate: Date,
}

export interface StoreOption {
    id: string,
    name: string,
}

export interface StoreDetail {
    id: string,
    name: string,
    city: string,
    address: string,
    country: string,
    postalCode: string,
    phone: string,
    lat: number,
    lgn: number,
    url: string,
}

export interface StorePendingTournament {
    id: string,
    title: string,
    description: string,
    date: string,
}

export interface StoreDetailResponse {
    store: StoreDetail,
    tournaments: StorePendingTournament[],
}
