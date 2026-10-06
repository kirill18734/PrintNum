"""Модульные тесты проверки запросов и декодирования данных этикетки."""

import base64
import unittest

from label_data import LabelRequestError, parse_label_request


class ParseLabelRequestTests(unittest.TestCase):
    def test_parses_plain_text_and_default_options(self):
        label = parse_label_request({
            'contentType': 'text',
            'content': ' Заказ № 123 ',
        })

        self.assertEqual(label['content_type'], 'text')
        self.assertEqual(label['content'], ' Заказ № 123 ')
        self.assertIsNone(label['code_image'])
        self.assertFalse(label['bold'])
        self.assertFalse(label['underline'])
        self.assertFalse(label['show_code_text'])

    def test_parses_code_image(self):
        image = b'\x89PNG\r\n\x1a\nimage data'
        label = parse_label_request({
            'contentType': 'qr',
            'content': 'https://example.com',
            'codeImage': base64.b64encode(image).decode('ascii'),
            'showCodeText': True,
        })

        self.assertEqual(label['content_type'], 'qr')
        self.assertEqual(label['code_image'], image)
        self.assertTrue(label['show_code_text'])

    def test_rejects_unknown_content_type(self):
        with self.assertRaises(LabelRequestError):
            parse_label_request({'contentType': 'pdf', 'content': 'file'})

    def test_rejects_missing_or_invalid_code_image(self):
        for image in (None, 'not-base64', base64.b64encode(b'not png').decode('ascii')):
            with self.subTest(image=image), self.assertRaises(LabelRequestError):
                parse_label_request({
                    'contentType': 'datamatrix',
                    'content': '123',
                    'codeImage': image,
                })

    def test_rejects_invalid_content_and_options(self):
        for body in (
            {'contentType': 'text', 'content': '   '},
            {'contentType': 'text', 'content': 'x' * 4097},
            {'contentType': 'text', 'content': 'ok', 'bold': 1},
        ):
            with self.subTest(body=body), self.assertRaises(LabelRequestError):
                parse_label_request(body)


if __name__ == '__main__':
    unittest.main()
