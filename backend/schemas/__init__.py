# Import order is critical for forward reference resolution
from .provider import Provider, ProviderCreate, ProviderUpdate, ProviderWithModels
from .benchmark import Benchmark, BenchmarkCreate, BenchmarkUpdate, BenchmarkBase
from .pricing import Pricing, PricingCreate, PricingUpdate, PricingBase
from .model import Model, ModelCreate, ModelUpdate, ModelWithDetails, ModelBase
from .comparison import (
    ComparisonTable, 
    ComparisonTableCreate, 
    ComparisonTableUpdate, 
    ComparisonTableWithItems,
    ComparisonItem,
    ComparisonItemCreate
)

# Rebuild schemas to resolve forward references
Model.model_rebuild()
# Resolve forward refs explicitly with namespace mapping to avoid runtime circular imports
ModelWithDetails.model_rebuild(_types_namespace={
    "Provider": Provider,
    "BenchmarkBase": BenchmarkBase,
    "PricingBase": PricingBase,
})

ProviderWithModels.model_rebuild(_types_namespace={
    "ModelBase": ModelBase,
})

__all__ = [
    "Provider", "ProviderCreate", "ProviderUpdate", "ProviderWithModels",
    "Model", "ModelCreate", "ModelUpdate", "ModelWithDetails",
    "Benchmark", "BenchmarkCreate", "BenchmarkUpdate",
    "Pricing", "PricingCreate", "PricingUpdate",
    "ComparisonTable", "ComparisonTableCreate", "ComparisonTableUpdate", "ComparisonTableWithItems",
    "ComparisonItem", "ComparisonItemCreate"
]