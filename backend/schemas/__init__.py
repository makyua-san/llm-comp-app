from .model import Model, ModelCreate, ModelUpdate, ModelWithDetails
from .provider import Provider, ProviderCreate, ProviderUpdate, ProviderWithModels
from .benchmark import Benchmark, BenchmarkCreate, BenchmarkUpdate
from .pricing import Pricing, PricingCreate, PricingUpdate
from .comparison import (
    ComparisonTable, 
    ComparisonTableCreate, 
    ComparisonTableUpdate, 
    ComparisonTableWithItems,
    ComparisonItem,
    ComparisonItemCreate
)

# Ensure forward references are resolved by binding ModelBase into provider module namespace
import sys as _sys
_provider_module = _sys.modules.get(__name__ + '.provider')
_model_module = _sys.modules.get(__name__ + '.model')
if _provider_module and _model_module:
    _provider_module.ModelBase = _model_module.ModelBase
    # rebuild schemas to resolve forward refs
    from typing import TYPE_CHECKING as _TYPE_CHECKING  # noqa: F401
    try:
        _provider_module.ProviderWithModels.model_rebuild()
    except AttributeError:
        pass

__all__ = [
    "Provider", "ProviderCreate", "ProviderUpdate", "ProviderWithModels",
    "Model", "ModelCreate", "ModelUpdate", "ModelWithDetails",
    "Benchmark", "BenchmarkCreate", "BenchmarkUpdate",
    "Pricing", "PricingCreate", "PricingUpdate",
    "ComparisonTable", "ComparisonTableCreate", "ComparisonTableUpdate", "ComparisonTableWithItems",
    "ComparisonItem", "ComparisonItemCreate"
]