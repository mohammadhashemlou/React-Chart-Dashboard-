import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartComponentProps, ChartDimensions, SeriesData } from '../types/chart.types';

const ChartComponent: React.FC<ChartComponentProps> = ({ title, data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        // Clear previous chart
        d3.select(svgRef.current).selectAll("*").remove();

        // Chart dimensions
        const dimensions: ChartDimensions = {
            width: 700,
            height: 350,
            margin: { top: 20, right: 30, bottom: 40, left: 60 }
        };

        const { width, height, margin } = dimensions;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const isMultiSeries = Array.isArray(data[0][1]);

        let xExtent: [number, number];
        let yExtent: [number, number];

        if (isMultiSeries)
        {

            // Multi-series data processing
            const series1: SeriesData[] = data.map(d => ({
                timestamp: d[0],
                value: Array.isArray(d[1]) ? d[1][0] : null
            })).filter(d => d.value !== null) as SeriesData[];

            const series2: SeriesData[] = data.map(d => ({
                timestamp: d[0],
                value: Array.isArray(d[1]) ? d[1][1] : null
            })).filter(d => d.value !== null) as SeriesData[];

            const series3: SeriesData[] = data.map(d => ({
                timestamp: d[0],
                value: Array.isArray(d[1]) ? d[1][2] : null
            })).filter(d => d.value !== null) as SeriesData[];

            xExtent = d3.extent(data, d => d[0]) as [number, number];
            yExtent = d3.extent([
                ...series1.map(d => d.value as number),
                ...series2.map(d => d.value as number),
                ...series3.map(d => d.value as number)
            ]) as [number, number];
        }

        else
        {
            // Single-series data processing
            const validData = data.filter(d => !Array.isArray(d[1]) && d[1] !== null);
            xExtent = d3.extent(validData, d => d[0]) as [number, number];
            yExtent = d3.extent(validData, d => d[1] as number) as [number, number];
        }

        // Create scales
        const xScale = d3.scaleLinear()
            .domain(xExtent)
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain(yExtent)
            .nice()
            .range([innerHeight, 0]);

        const line = d3.line<SeriesData>()
            .x(d => xScale(d.timestamp))
            .y(d => yScale(d.value as number))
            .defined(d => d.value !== null)
            .curve(d3.curveMonotoneX);

        // Add axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .append("text")
            .attr("x", innerWidth / 2)
            .attr("y", 35)
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .text("Time");

        g.append("g")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -innerHeight / 2)
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .text("Value");

        // Add grid lines
        const xGridAxis = d3.axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickFormat(() => "");

        const yGridAxis = d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => "");

        g.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xGridAxis)
            .style("stroke-dasharray", "2,2")
            .style("opacity", 0.2);

        g.append("g")
            .attr("class", "grid")
            .call(yGridAxis)
            .style("stroke-dasharray", "2,2")
            .style("opacity", 0.2);

        // Render chart based on detected type
        if (isMultiSeries)
        {
            // Multi-series chart - Blue, Green, Red
            const colors: string[] = ["#1f77b4", "#2ca02c", "#d62728"];

            for (let i = 0; i < 3; i++) {
                const seriesData: SeriesData[] = data.map(d => ({
                    timestamp: d[0],
                    value: Array.isArray(d[1]) ? d[1][i] : null
                }));

                g.append("path")
                    .datum(seriesData)
                    .attr("fill", "none")
                    .attr("stroke", colors[i])
                    .attr("stroke-width", 2.5)
                    .attr("d", line);

                g.selectAll(`.dot-series-${i}`)
                    .data(seriesData.filter(d => d.value !== null))
                    .enter().append("circle")
                    .attr("class", `dot-series-${i}`)
                    .attr("cx", d => xScale(d.timestamp))
                    .attr("cy", d => yScale(d.value as number))
                    .attr("r", 4)
                    .attr("fill", colors[i])
                    .attr("stroke", "white")
                    .attr("stroke-width", 1);
            }
        }

        else
        {
            // Single-series chart
            const validData: SeriesData[] = data
                .filter(d => !Array.isArray(d[1]) && d[1] !== null)
                .map(d => ({
                    timestamp: d[0],
                    value: d[1] as number
                }));

            g.append("path")
                .datum(validData)
                .attr("fill", "none")
                .attr("stroke", "#1f77b4")
                .attr("stroke-width", 2.5)
                .attr("d", line);

            // Add dots for valid points
            g.selectAll(".dot")
                .data(validData)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => xScale(d.timestamp))
                .attr("cy", d => yScale(d.value as number))
                .attr("r", 4)
                .attr("fill", "#1f77b4")
                .attr("stroke", "white")
                .attr("stroke-width", 1);
        }

    }, [data]);

    const isMultiSeries = data && data.length > 0 && Array.isArray(data[0][1]);

    return (
        <div style={{
            marginBottom: '40px',
            padding: '25px',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            backgroundColor: '#fafafa'
        }}>
            <h3 style={{
                marginBottom: '20px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#333'
            }}>
                {title}
            </h3>

            <svg ref={svgRef}></svg>

            <div style={{
                marginTop: '15px',
                fontSize: '13px',
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>
                    <strong>Chart Type:</strong> {isMultiSeries ? 'Multi-Series' : 'Single-Series'}
                </span>

                {isMultiSeries && (
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span style={{ color: '#1f77b4' }}>● Series 1</span>
                        <span style={{ color: '#2ca02c' }}>● Series 2</span>
                        <span style={{ color: '#d62728' }}>● Series 3</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChartComponent;