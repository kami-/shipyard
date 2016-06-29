export enum Side {
    BLUFOR,
    OPFOR,
    INDFOR
}

export interface Template {
    id: string;
    name: string;
    description: string;
}

export function getSides(): Side[] {
    return [Side.BLUFOR, Side.OPFOR, Side.INDFOR];
}

export function sideToString(s: Side): string {
    return Side[s];
}

export function getSideNames(): string[] {
    return getSides().map(sideToString);
}

export function stringToSide(s: string): Side {
    return Side[s];
}

export function armaStringToSide(s: string): Side {
    switch (s) {
        case 'east':
            return Side.OPFOR;
        case 'guer':
            return Side.INDFOR;
        default:
            return Side.BLUFOR;
    }
}