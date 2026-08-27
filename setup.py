from setuptools import setup, find_packages

setup(
    name='ramtsr',
    version='0.1.0',
    author='Gowthum Vijaay D',
    description='Reliability-Aware Multi-Temporal Super Resolution for Satellite Imagery',
    packages=find_packages(),
    install_requires=[
        # dependencies would go here, usually parsed from requirements.txt
        'torch>=2.0.0',
        'numpy',
        'rasterio',
        'scipy',
        'fastapi',
        'uvicorn',
        'tqdm',
        'requests',
        'einops'
    ],
    python_requires='>=3.9',
    entry_points={
        'console_scripts': [
            'ramtsr-demo=scripts.demo:main',
            # 'ramtsr-train=scripts.train:main',
            # 'ramtsr-evaluate=scripts.evaluate:main'
        ]
    }
)
