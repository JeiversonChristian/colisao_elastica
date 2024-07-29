import sympy as sp

# Definir variáveis
x, y = sp.symbols('x y')
a, b, c, d = sp.symbols('a b c d')

# Definir equações
eq1 = sp.Eq(a*x**2 + b*y**2, a*c**2 + b*d**2)
eq2 = sp.Eq(a*x + b*y, a*c + b*d)

# Resolver sistema de equações
sol = sp.solve((eq1, eq2), (x, y))

# Exibir soluções
print("teste")
print(sol)

m1 = 10
m2 = 200000000000000000000000
v1 = 5
v2 = 0
a = m1
b = m2
c = v1
d = v2
r1 = (-(-a*c - b*d + b*(2*a*c - a*d + b*d)/(a + b))/a, (2*a*c - a*d + b*d)/(a + b))
r2 = (((m1-m2)/(m1+m2))*v1,((2*m1)/(m1+m2))*v1)
print(r1)
print(r2)