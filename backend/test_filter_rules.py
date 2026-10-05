import unittest

from filter_rules import find_excluded_rule


class FindExcludedRuleTests(unittest.TestCase):
    def test_matches_phrase_without_case_sensitivity(self):
        self.assertEqual(
            find_excluded_rule("Заказ: ПРЯМОЙ ПОТОК 42", ["Прямой поток"]),
            "Прямой поток",
        )

    def test_returns_none_when_no_phrase_matches(self):
        self.assertIsNone(find_excluded_rule("Заказ 42", ["Прямой поток"]))

    def test_ignores_invalid_rules(self):
        self.assertIsNone(
            find_excluded_rule("Прямой поток", [None, "", "   ", 42])
        )


if __name__ == "__main__":
    unittest.main()
