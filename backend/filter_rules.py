def find_excluded_rule(text, rules):
    """Return the first configured phrase found in text, ignoring case."""
    if not isinstance(text, str) or not isinstance(rules, list):
        return None

    normalized_text = text.casefold()
    for rule in rules:
        if isinstance(rule, str) and rule.strip():
            normalized_rule = rule.strip()
            if normalized_rule.casefold() in normalized_text:
                return normalized_rule

    return None
