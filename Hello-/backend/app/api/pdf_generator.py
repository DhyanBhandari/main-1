"""
PDF Report Generator for Planetary Health Reports.

Creates professional PDF reports with:
- Location header
- Overall health score gauge
- 5-pillar radar chart
- Detailed metrics tables
- Recommendations
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.graphics.shapes import Drawing, Circle, Wedge, String, Line, Polygon
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics import renderPDF
from datetime import datetime
from pathlib import Path
import tempfile
import math

from app.config import PDF_OUTPUT_DIR


def generate_report_pdf(lat: float, lon: float, data: dict) -> str:
    """
    Generate a comprehensive PDF report.

    Args:
        lat: Latitude
        lon: Longitude
        data: Query result data

    Returns:
        Path to generated PDF file
    """
    # Create output path
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{lat:.4f}_{lon:.4f}_{timestamp}.pdf"
    pdf_path = PDF_OUTPUT_DIR / filename

    # Create document
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )

    # Build content
    elements = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor("#2c3e50"),
        alignment=1  # Center
    )

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor("#7f8c8d"),
        alignment=1
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.HexColor("#2c3e50")
    )

    # Title
    elements.append(Paragraph("Planetary Health Report", title_style))
    elements.append(Paragraph(
        f"Location: {lat:.4f}, {lon:.4f}",
        subtitle_style
    ))
    elements.append(Paragraph(
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        subtitle_style
    ))
    elements.append(Spacer(1, 30))

    # Overall Score
    summary = data.get("summary", {})
    overall_score = summary.get("overall_score", 0) or 0

    elements.append(Paragraph("Overall Health Score", heading_style))

    # Score gauge drawing
    score_drawing = create_score_gauge(overall_score)
    elements.append(score_drawing)
    elements.append(Spacer(1, 20))

    # Score interpretation
    interpretation = get_score_interpretation(overall_score)
    elements.append(Paragraph(
        f"<b>Status:</b> {interpretation}",
        styles['Normal']
    ))
    elements.append(Spacer(1, 30))

    # Pillar Scores
    elements.append(Paragraph("Pillar Scores", heading_style))

    pillar_scores = summary.get("pillar_scores", {})
    pillars_data = data.get("pillars", {})

    pillar_info = {
        "A": ("Atmospheric", "#3498db"),
        "B": ("Biodiversity", "#27ae60"),
        "C": ("Carbon", "#8e44ad"),
        "D": ("Degradation", "#e74c3c"),
        "E": ("Ecosystem", "#f39c12")
    }

    # Pillar scores table
    table_data = [["Pillar", "Score", "Status"]]
    for pid in ["A", "B", "C", "D", "E"]:
        name, color = pillar_info.get(pid, (pid, "#000000"))
        score = pillar_scores.get(pid, 0) or 0
        status = get_score_interpretation(score)
        table_data.append([f"{pid} - {name}", f"{score}/100", status])

    pillar_table = Table(table_data, colWidths=[200, 80, 100])
    pillar_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#ecf0f1")),
        ('GRID', (0, 0), (-1, -1), 1, colors.white),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    elements.append(pillar_table)
    elements.append(Spacer(1, 30))

    # Detailed Metrics
    elements.append(Paragraph("Detailed Metrics", heading_style))

    for pillar_key, pillar_data in pillars_data.items():
        pillar_id = pillar_key[0] if pillar_key else ""
        name, color = pillar_info.get(pillar_id, (pillar_key, "#000000"))

        elements.append(Paragraph(
            f"<b>{pillar_id} - {name}</b>",
            styles['Normal']
        ))

        metrics = pillar_data.get("metrics", {})
        if metrics:
            metric_table_data = [["Metric", "Value", "Quality"]]
            for metric_name, metric_data in metrics.items():
                value = metric_data.get("value")
                unit = metric_data.get("unit", "")
                quality = metric_data.get("quality", "unknown")

                if value is not None:
                    value_str = f"{value:.4g} {unit}" if isinstance(value, (int, float)) else str(value)
                else:
                    value_str = "N/A"

                metric_table_data.append([
                    metric_name.replace("_", " ").title(),
                    value_str,
                    quality.title()
                ])

            metric_table = Table(metric_table_data, colWidths=[180, 120, 80])
            metric_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(color)),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc3c7")),
                ('TOPPADDING', (0, 1), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
            ]))
            elements.append(metric_table)
            elements.append(Spacer(1, 15))

    # Data Quality
    elements.append(Paragraph("Data Quality", heading_style))
    completeness = summary.get("data_completeness", 0) or 0
    elements.append(Paragraph(
        f"Data Completeness: {completeness*100:.0f}%",
        styles['Normal']
    ))

    quality_flags = summary.get("quality_flags", [])
    if quality_flags:
        elements.append(Paragraph(
            f"Quality Issues: {', '.join(quality_flags[:5])}",
            styles['Normal']
        ))
    elements.append(Spacer(1, 30))

    # Footer
    elements.append(Paragraph(
        "Generated by Planetary Health Monitor - Powered by Google Earth Engine",
        subtitle_style
    ))

    # Build PDF
    doc.build(elements)

    return str(pdf_path)


def create_score_gauge(score: int) -> Drawing:
    """Create a score gauge visualization."""
    drawing = Drawing(400, 120)

    # Background arc
    cx, cy = 200, 100
    radius = 80

    # Score color
    if score >= 80:
        color = colors.HexColor("#27ae60")
    elif score >= 60:
        color = colors.HexColor("#2ecc71")
    elif score >= 40:
        color = colors.HexColor("#f39c12")
    else:
        color = colors.HexColor("#e74c3c")

    # Background semicircle
    for i in range(180):
        angle = math.radians(180 - i)
        x1 = cx + (radius - 10) * math.cos(angle)
        y1 = cy + (radius - 10) * math.sin(angle)
        x2 = cx + radius * math.cos(angle)
        y2 = cy + radius * math.sin(angle)
        line = Line(x1, y1, x2, y2)
        line.strokeColor = colors.HexColor("#ecf0f1")
        line.strokeWidth = 2
        drawing.add(line)

    # Score arc
    score_angle = int(180 * score / 100)
    for i in range(score_angle):
        angle = math.radians(180 - i)
        x1 = cx + (radius - 10) * math.cos(angle)
        y1 = cy + (radius - 10) * math.sin(angle)
        x2 = cx + radius * math.cos(angle)
        y2 = cy + radius * math.sin(angle)
        line = Line(x1, y1, x2, y2)
        line.strokeColor = color
        line.strokeWidth = 3
        drawing.add(line)

    # Score text
    score_text = String(cx, cy - 20, str(score), textAnchor='middle')
    score_text.fontSize = 36
    score_text.fontName = 'Helvetica-Bold'
    score_text.fillColor = color
    drawing.add(score_text)

    label = String(cx, cy - 45, "/100", textAnchor='middle')
    label.fontSize = 14
    label.fillColor = colors.HexColor("#7f8c8d")
    drawing.add(label)

    return drawing


def get_score_interpretation(score: int) -> str:
    """Get human-readable interpretation of score."""
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Moderate"
    elif score >= 20:
        return "Poor"
    else:
        return "Critical"
