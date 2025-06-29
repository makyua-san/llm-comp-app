import json
import re
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from datetime import datetime, date
from decimal import Decimal

class GeminiScrapingService:
    """Service for extracting data from web content using Gemini API"""
    
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def extract_pricing_data(self, url: str, model_name: Optional[str] = None, provider_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Extract pricing data from a URL"""
        prompt = self._build_pricing_prompt(url, model_name, provider_name)
        
        try:
            response = self.model.generate_content([{"text": prompt}])
            return self._parse_pricing_response(response.text)
        except Exception as e:
            raise Exception(f"Failed to extract pricing data: {str(e)}")
    
    def extract_benchmark_data(self, url: str, model_name: Optional[str] = None, provider_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Extract benchmark data from a URL"""
        prompt = self._build_benchmark_prompt(url, model_name, provider_name)
        
        try:
            response = self.model.generate_content([{"text": prompt}])
            return self._parse_benchmark_response(response.text)
        except Exception as e:
            raise Exception(f"Failed to extract benchmark data: {str(e)}")
    
    def extract_both_data(self, url: str, model_name: Optional[str] = None, provider_name: Optional[str] = None) -> Dict[str, List[Dict[str, Any]]]:
        """Extract both pricing and benchmark data from a URL"""
        prompt = self._build_combined_prompt(url, model_name, provider_name)
        
        try:
            response = self.model.generate_content([{"text": prompt}])
            return self._parse_combined_response(response.text)
        except Exception as e:
            raise Exception(f"Failed to extract combined data: {str(e)}")
    
    def _build_pricing_prompt(self, url: str, model_name: Optional[str], provider_name: Optional[str]) -> str:
        """Build prompt for pricing data extraction"""
        focus_text = f"Focus specifically on {model_name} from {provider_name}." if model_name and provider_name else ""
        
        return f"""
        Please extract pricing information from this URL: {url}
        
        {focus_text}
        
        Look for the following pricing information:
        - Model names
        - Input token pricing
        - Output token pricing
        - Request-based pricing
        - Price per unit (1K tokens, 1M tokens, etc.)
        - Currency (USD, EUR, etc.)
        - Effective dates or validity periods
        - Any special pricing tiers or discounts
        
        Return the data in valid JSON format only, no other text:
        {{
            "pricing_data": [
                {{
                    "model_name": "exact model name",
                    "provider": "provider name",
                    "price_type": "input_tokens|output_tokens|requests",
                    "price": "numeric value only",
                    "currency": "USD",
                    "unit": "per_1k_tokens|per_million_tokens|per_request",
                    "effective_date": "YYYY-MM-DD or null",
                    "notes": "any additional pricing notes"
                }}
            ]
        }}
        
        If no pricing data is found, return: {{"pricing_data": []}}
        """
    
    def _build_benchmark_prompt(self, url: str, model_name: Optional[str], provider_name: Optional[str]) -> str:
        """Build prompt for benchmark data extraction"""
        focus_text = f"Focus specifically on {model_name} from {provider_name}." if model_name and provider_name else ""
        
        return f"""
        Please extract benchmark performance data from this URL: {url}
        
        {focus_text}
        
        Look for the following benchmark information:
        - Model names
        - Benchmark test names (MMLU, HellaSwag, TruthfulQA, GSM8K, HumanEval, etc.)
        - Performance scores or metrics
        - Units (accuracy, percentage, score, etc.)
        - Test dates
        - Evaluation conditions or parameters
        
        Return the data in valid JSON format only, no other text:
        {{
            "benchmark_data": [
                {{
                    "model_name": "exact model name",
                    "provider": "provider name",
                    "benchmark_name": "exact benchmark name",
                    "score": "numeric value only",
                    "unit": "accuracy|percentage|score",
                    "test_date": "YYYY-MM-DD or null",
                    "notes": "any additional benchmark notes"
                }}
            ]
        }}
        
        If no benchmark data is found, return: {{"benchmark_data": []}}
        """
    
    def _build_combined_prompt(self, url: str, model_name: Optional[str], provider_name: Optional[str]) -> str:
        """Build prompt for combined data extraction"""
        focus_text = f"Focus specifically on {model_name} from {provider_name}." if model_name and provider_name else ""
        
        return f"""
        Please extract both pricing and benchmark data from this URL: {url}
        
        {focus_text}
        
        Extract all available pricing and performance data.
        
        Return the data in valid JSON format only, no other text:
        {{
            "pricing_data": [
                {{
                    "model_name": "exact model name",
                    "provider": "provider name",
                    "price_type": "input_tokens|output_tokens|requests",
                    "price": "numeric value only",
                    "currency": "USD",
                    "unit": "per_1k_tokens|per_million_tokens|per_request",
                    "effective_date": "YYYY-MM-DD or null",
                    "notes": "any additional pricing notes"
                }}
            ],
            "benchmark_data": [
                {{
                    "model_name": "exact model name",
                    "provider": "provider name",
                    "benchmark_name": "exact benchmark name",
                    "score": "numeric value only",
                    "unit": "accuracy|percentage|score",
                    "test_date": "YYYY-MM-DD or null",
                    "notes": "any additional benchmark notes"
                }}
            ]
        }}
        
        If no data is found for either category, return empty arrays.
        """
    
    def _parse_pricing_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse pricing data from Gemini response"""
        try:
            # Clean the response text
            json_text = self._extract_json_from_response(response_text)
            data = json.loads(json_text)
            return data.get('pricing_data', [])
        except json.JSONDecodeError:
            # Fallback: try to extract data using regex
            return self._extract_pricing_with_regex(response_text)
    
    def _parse_benchmark_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse benchmark data from Gemini response"""
        try:
            json_text = self._extract_json_from_response(response_text)
            data = json.loads(json_text)
            return data.get('benchmark_data', [])
        except json.JSONDecodeError:
            return self._extract_benchmark_with_regex(response_text)
    
    def _parse_combined_response(self, response_text: str) -> Dict[str, List[Dict[str, Any]]]:
        """Parse combined data from Gemini response"""
        try:
            json_text = self._extract_json_from_response(response_text)
            data = json.loads(json_text)
            return {
                'pricing_data': data.get('pricing_data', []),
                'benchmark_data': data.get('benchmark_data', [])
            }
        except json.JSONDecodeError:
            return {
                'pricing_data': self._extract_pricing_with_regex(response_text),
                'benchmark_data': self._extract_benchmark_with_regex(response_text)
            }
    
    def _extract_json_from_response(self, response_text: str) -> str:
        """Extract JSON from response text"""
        # Remove markdown formatting
        text = response_text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        
        # Find JSON object
        start = text.find('{')
        end = text.rfind('}') + 1
        if start != -1 and end != 0:
            return text[start:end]
        
        return text
    
    def _extract_pricing_with_regex(self, text: str) -> List[Dict[str, Any]]:
        """Fallback method to extract pricing using regex"""
        # This is a simplified fallback - in a real implementation,
        # you'd want more sophisticated parsing
        return []
    
    def _extract_benchmark_with_regex(self, text: str) -> List[Dict[str, Any]]:
        """Fallback method to extract benchmarks using regex"""
        # This is a simplified fallback - in a real implementation,
        # you'd want more sophisticated parsing
        return []