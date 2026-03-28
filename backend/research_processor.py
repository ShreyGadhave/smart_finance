def process_research_data(overview, earnings, yinfo):
    text_data = []

    # Overview
    if overview:
        text_data.append(f"Company: {overview.get('Name')}")
        text_data.append(f"Sector: {overview.get('Sector')}")
        text_data.append(f"Description: {overview.get('Description')}")

    # Earnings
    if earnings.get("annualEarnings"):
        for e in earnings["annualEarnings"][:3]:
            text_data.append(
                f"Year {e['fiscalDateEnding']} earnings: {e['reportedEPS']}"
            )

    # Yahoo info
    if yinfo:
        text_data.append(f"Market Cap: {yinfo.get('marketCap')}")
        text_data.append(f"PE Ratio: {yinfo.get('trailingPE')}")

    return "\n".join(text_data)