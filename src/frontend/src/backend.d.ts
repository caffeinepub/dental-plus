import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Reservation {
    id: bigint;
    service: string;
    name: string;
    message: string;
    timestamp: bigint;
    phone: string;
}
export interface backendInterface {
    getAvailableSlots(): Promise<bigint>;
    getReservations(): Promise<Array<Reservation>>;
    makeReservation(name: string, phone: string, service: string, message: string): Promise<bigint>;
    resetSlots(n: bigint): Promise<void>;
}
