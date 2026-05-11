import plotly.graph_objects as go
import numpy as np

# 1. Setup the Grid (Independent Variables x and y)
x = np.linspace(-5, 5, 5)
y = np.linspace(-5, 5, 5)
X, Y = np.meshgrid(x, y)

# 2. Define the Function (The Dependent Variable z)
# Formula: z = cos(sqrt(x^2 + y^2))
R = np.sqrt(X**2 + Y**2)
Z = np.cos(R)

# 3. Create the Surface Plot
fig = go.Figure(data=[go.Surface(z=Z, x=X, y=Y, colorscale='Viridis')])

# 4. Styling for your Dark Theme
fig.update_layout(
    title='Multivariable Function: $z = \cos(\sqrt{x^2 + y^2})$',
    scene = dict(
        xaxis_title='X Axis',
        yaxis_title='Y Axis',
        zaxis_title='Z (Output)'
    ),
    template="plotly_dark",
    autosize=False,
    width=800, height=800,
    margin=dict(l=65, r=50, b=65, t=90)
)

# 5. Save and Show
fig.write_html("multivariable_test.html", auto_open=True)