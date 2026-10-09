# Galvosūkiai

Paprasta svetainė su galvosūkiais lietuvių kalba: kryžiažodžiai, žodžių baigimas, trūkstami žodžiai sakiniuose, lygtys, sekos, lemputės ir sudoku. Dideli rašmenys, viskas žaidžiama tik pele.

(English: a simple static Lithuanian puzzle site for GitHub Pages, playable with the mouse only.)

## Paleidimas vietoje

Iš repozitorijos šaknies:

```
python -m http.server 8080
```

Tada atidarykite http://localhost:8080.

## Testai

```
npm test
```

Naudojamas tik `node:test`, jokių priklausomybių.

## Tekstai

Visi lietuviški tekstai yra aplankuose `js/data/` ir `js/games/`.

## Padėka

Lemputės ir sudoku žaidimus įkvėpė Simon Tatham's Portable Puzzle Collection (MIT licencija).
