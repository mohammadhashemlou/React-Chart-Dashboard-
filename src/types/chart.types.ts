export type SingleSeriesDataPoint = [number, number | null];
export type MultiSeriesDataPoint = [number, [number | null, number | null, number | null]];
export type DataPoint = SingleSeriesDataPoint | MultiSeriesDataPoint;

export interface ChartData {
    title: string;
    data: DataPoint[];
}

export interface ChartComponentProps {
    title: string;
    data: DataPoint[];
}

// D3 related types
export interface ChartDimensions {
    width: number;
    height: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export interface SeriesData {
    timestamp: number;
    value: number | null;
}

// API response types
export type ChartApiResponse = ChartData[];

// Error types
export interface ChartError {
    message: string;
    type: 'FETCH_ERROR' | 'VALIDATION_ERROR' | 'RENDER_ERROR';
}