import plotly.graph_objects as go
import numpy as np

# 1. Generate some Engineering Data (A 3D Spiral Waveform)
t = np.linspace(0, 20, 500)
x = np.cos(t)
y = np.sin(t)
z = t  # Time or Frequency axis

# 2. Create the 3D Scatter plot
fig = go.Figure(data=[go.Scatter3d(
    x=x, y=y, z=z,
    mode='lines',
    line=dict(
        color=z,        # Color changes with 'time'
        colorscale='Viridis',
        width=6
    )
)])

# 3. Add Professional Labels
fig.update_layout(
    title="3D Electromagnetic Wave Propagation (Test)",
    scene=dict(
        xaxis_title='Amplitude (X)',
        yaxis_title='Amplitude (Y)',
        zaxis_title='Phase / Time (Z)'
    ),
    template="plotly_dark" # Fits your VS Code theme!
)

# 4. Save and Open
# This creates a file in your project folder and opens your browser
fig.write_html("signal_test.html", auto_open=True)