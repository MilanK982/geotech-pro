from rest_framework import serializers
from .models import GeotechnicalModel, Layer, CptTest, CptData

class CptDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CptData
        fields = ['id', 'depth', 'qc', 'fs', 'u']

class CptTestSerializer(serializers.ModelSerializer):
    data = CptDataSerializer(many=True)

    class Meta:
        model = CptTest
        fields = ['id', 'name', 'data']

    def create(self, validated_data):
        data = validated_data.pop('data')
        cpt_test = CptTest.objects.create(**validated_data)
        for item in data:
            CptData.objects.create(cpt_test=cpt_test, **item)
        return cpt_test

    def update(self, instance, validated_data):
        data = validated_data.pop('data')
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        instance.data.all().delete()
        for item in data:
            CptData.objects.create(cpt_test=instance, **item)
        return instance

class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = ['id', 'name', 'depth', 'unit_weight', 'cohesion', 'friction_angle', 'compressibility', 'permeability', 'cpt_data']

class GeotechnicalModelSerializer(serializers.ModelSerializer):
    layers = LayerSerializer(many=True)
    cpt_tests = CptTestSerializer(many=True)

    class Meta:
        model = GeotechnicalModel
        fields = ['id', 'name', 'npv', 'npv_max', 'layers', 'cpt_tests']

    def create(self, validated_data):
        layers_data = validated_data.pop('layers')
        cpt_tests_data = validated_data.pop('cpt_tests')
        model = GeotechnicalModel.objects.create(**validated_data)
        for layer_data in layers_data:
            Layer.objects.create(model=model, **layer_data)
        for cpt_test_data in cpt_tests_data:
            data = cpt_test_data.pop('data')
            cpt_test = CptTest.objects.create(model=model, **cpt_test_data)
            for item in data:
                CptData.objects.create(cpt_test=cpt_test, **item)
        return model

    def update(self, instance, validated_data):
        layers_data = validated_data.pop('layers')
        cpt_tests_data = validated_data.pop('cpt_tests')
        instance.name = validated_data.get('name', instance.name)
        instance.npv = validated_data.get('npv', instance.npv)
        instance.npv_max = validated_data.get('npv_max', instance.npv_max)
        instance.save()
        instance.layers.all().delete()
        instance.cpt_tests.all().delete()
        for layer_data in layers_data:
            Layer.objects.create(model=instance, **layer_data)
        for cpt_test_data in cpt_tests_data:
            data = cpt_test_data.pop('data')
            cpt_test = CptTest.objects.create(model=instance, **cpt_test_data)
            for item in data:
                CptData.objects.create(cpt_test=cpt_test, **item)
        return instance