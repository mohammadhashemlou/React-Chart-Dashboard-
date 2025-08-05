import React, { useState, useEffect } from 'react';
import ChartComponent from './ChartComponent';
import { ChartData, ChartApiResponse, ChartError } from '../types/chart.types';

const ChartDashboard: React.FC = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ChartError | null>(null);

    useEffect(() => {
        const loadChartData = async (): Promise<void> => {
            try {
                setLoading(true);

                // Load data from data.json file
                const response = await fetch('/data.json');

                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
                }

                const data: ChartApiResponse = await response.json();

                // Validate data structure
                if (!Array.isArray(data)) {
                    const validationError: ChartError = {
                        message: 'Invalid data format: Expected an array of chart objects',
                        type: 'VALIDATION_ERROR'
                    };
                    throw validationError;
                }

                // Validate each chart object
                data.forEach((chart: ChartData, index: number) => {
                    if (!chart.title || !chart.data) {
                        const validationError: ChartError = {
                            message: `Invalid chart object at index ${index}: Missing title or data`,
                            type: 'VALIDATION_ERROR'
                        };
                        throw validationError;
                    }
                    if (!Array.isArray(chart.data)) {
                        const validationError: ChartError = {
                            message: `Invalid chart data at index ${index}: Expected an array`,
                            type: 'VALIDATION_ERROR'
                        };
                        throw validationError;
                    }
                });

                setChartData(data);
                setError(null);

            } catch (err) {
                console.error('Error loading chart data:', err);

                const chartError: ChartError = {
                    message: err instanceof Error ? err.message : 'Unknown error occurred',
                    type: 'FETCH_ERROR'
                };

                setError(chartError);
            } finally {
                setLoading(false);
            }
        };

        loadChartData();
    }, []);

    const handleRetry = (): void => {
        window.location.reload();
    };

    // Loading state
    if (loading) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }} />
                    <p style={{ fontSize: '16px', color: '#666' }}>Loading chart data...</p>
                </div>
                <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#e74c3c',
                backgroundColor: '#fdf2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                margin: '20px'
            }}>
                <h2 style={{ marginBottom: '10px' }}>⚠️ Error Loading Data</h2>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                    <strong>Type:</strong> {error.type}
                </p>
                <p style={{ fontSize: '16px', marginBottom: '20px' }}>{error.message}</p>
                <button
                    onClick={handleRetry}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // No data state
    if (!chartData || chartData.length === 0) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666'
            }}>
                <h2>📊 No Chart Data Available</h2>
                <p>Please make sure data.json file exists in the public folder.</p>
            </div>
        );
    }

    // Success state - render charts
    return (
        <div style={{
            padding: '30px',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#2c3e50',
                    marginBottom: '10px'
                }}>
                    Chart Dashboard
                </h1>
                <p style={{
                    fontSize: '16px',
                    color: '#7f8c8d',
                    marginBottom: '10px'
                }}>
                    Displaying {chartData.length} chart{chartData.length !== 1 ? 's' : ''} with automatic type detection
                </p>
            </header>

            <main>
                {chartData.map((chart: ChartData, index: number) => (
                    <ChartComponent
                        key={`chart-${index}`}
                        title={chart.title}
                        data={chart.data}
                    />
                ))}
            </main>

        </div>
    );
};

export default ChartDashboard;