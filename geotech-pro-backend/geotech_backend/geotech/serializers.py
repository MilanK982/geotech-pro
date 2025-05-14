# geotech/serializers.py
from rest_framework import serializers
from .models import GeotechnicalModel, Layer, CptTest, CptData, Project
from django.contrib.auth.models import User

class ProjectSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    models_count = serializers.SerializerMethodField()
    cpt_tests_count = serializers.SerializerMethodField()
    layers_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'location', 'client', 'status', 
                 'start_date', 'end_date', 'created_at', 'updated_at', 'user',
                 'models_count', 'cpt_tests_count', 'layers_count']

    def get_models_count(self, obj):
        try:
            return obj.geotechnical_models.all().count()
        except Exception as e:
            print(f"Error in get_models_count: {str(e)}")
            return 0

    def get_cpt_tests_count(self, obj):
        try:
            return CptTest.objects.filter(model__project=obj).count()
        except Exception as e:
            print(f"Error in get_cpt_tests_count: {str(e)}")
            return 0

    def get_layers_count(self, obj):
        try:
            return Layer.objects.filter(model__project=obj).count()
        except Exception as e:
            print(f"Error in get_layers_count: {str(e)}")
            return 0

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CptDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CptData
        fields = ['id', 'depth', 'qc', 'fs', 'u2']

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
    layers = LayerSerializer(many=True, required=False)
    cpt_tests = CptTestSerializer(many=True, required=False)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    project_id = serializers.IntegerField(source='project.id', read_only=True)

    class Meta:
        model = GeotechnicalModel
        fields = ['id', 'user', 'name', 'npv', 'npv_max', 'layers', 'cpt_tests', 'project', 'project_id']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.layers.exists():
            data['layers'] = []
        if not instance.cpt_tests.exists():
            data['cpt_tests'] = []
        return data

    def create(self, validated_data):
        layers_data = validated_data.pop('layers', [])
        cpt_tests_data = validated_data.pop('cpt_tests', [])
        model = GeotechnicalModel.objects.create(user=self.context['request'].user, **validated_data)
        
        for layer_data in layers_data:
            Layer.objects.create(model=model, **layer_data)
            
        for cpt_test_data in cpt_tests_data:
            data = cpt_test_data.pop('data', [])
            cpt_test = CptTest.objects.create(model=model, **cpt_test_data)
            for item in data:
                CptData.objects.create(cpt_test=cpt_test, **item)
        return model

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.npv = validated_data.get('npv', instance.npv)
        instance.npv_max = validated_data.get('npv_max', instance.npv_max)
        instance.save()

        if 'layers' in validated_data:
            instance.layers.all().delete()
            for layer_data in validated_data['layers']:
                Layer.objects.create(model=instance, **layer_data)

        if 'cpt_tests' in validated_data:
            instance.cpt_tests.all().delete()
            for cpt_test_data in validated_data['cpt_tests']:
                data = cpt_test_data.pop('data', [])
                cpt_test = CptTest.objects.create(model=instance, **cpt_test_data)
                for item in data:
                    CptData.objects.create(cpt_test=instance, **item)

        return instance