package org.kd;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {

        var tank = new Sprite(SpritePicture.TANK);
        var skull = new Sprite(SpritePicture.SKULL);
        var monster = new Sprite(SpritePicture.MONSTER);

        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("My Swing App");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setSize(400, 300);
            frame.getContentPane().setBackground(java.awt.Color.BLACK);
            frame.add(new JLabel("Hello, Sprites!", JLabel.CENTER));
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
        });
    }
}
