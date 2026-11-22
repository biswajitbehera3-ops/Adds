"""Brand test: animated bar chart for a news explainer (DEMO numbers - replace with sourced data before use)."""
from manim import *

INK, AMBER, TEAL, RED, PAPER = "#111418", "#FFC83D", "#2EC4B6", "#FF4D4D", "#F6F1E7"
FONT = "Inter Display Black"


class NewsBars(Scene):
    def construct(self):
        self.camera.background_color = INK
        title = Text("DEMO: delayed flights per hour", font=FONT, color=PAPER).scale(0.7).to_edge(UP)
        data = [("6 AM", 2, TEAL), ("9 AM", 5, TEAL), ("12 PM", 9, RED), ("3 PM", 4, AMBER)]
        bars = VGroup()
        for i, (lab, v, c) in enumerate(data):
            bar = Rectangle(width=1.4, height=v * 0.45, fill_color=c, fill_opacity=1, stroke_color=PAPER, stroke_width=4)
            bar.move_to([-4.5 + i * 3, -2.6 + v * 0.225, 0])
            num = Text(str(v), font=FONT, color=PAPER).scale(0.8).next_to(bar, UP, buff=0.15)
            lbl = Text(lab, font=FONT, color=PAPER).scale(0.5).next_to(bar, DOWN, buff=0.2)
            bars.add(VGroup(bar, num, lbl))
        self.play(Write(title), run_time=0.6)
        for g in bars:
            self.play(GrowFromEdge(g[0], DOWN), FadeIn(g[1], shift=UP * 0.3), FadeIn(g[2]), run_time=0.45)
        self.play(Indicate(bars[2][0], color=RED, scale_factor=1.08), run_time=0.8)
        self.wait(1)
